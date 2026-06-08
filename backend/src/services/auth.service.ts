import { ITokenPair } from "../interfaces/IToken";
import IUser, { IUserDTO, IUserRegisterDTO } from "../interfaces/IUser";
import { userService } from "./user.service";
import { passwordService } from "./password.service";
import { userRepository } from "../repositories/user.repository";
import { tokenService } from "./token.service";
import { tokenRepository } from "../repositories/token.repository";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";

class AuthService {
    public async register(
        user: IUserRegisterDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        await userService.isEmailUnique(user.email);

        const password = await passwordService.hashPassword(user.password);

        const newUser = await userRepository.createUser({ ...user, password });

        const tokens = tokenService.generateToken({
            userId: newUser._id,
            role: newUser.role,
        });

        await tokenRepository.create({ ...tokens, _userId: newUser._id });

        return { user: newUser, tokens };
    }

    public async login(
        dto: IUserDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        const user = await userRepository.getUserByEmail(dto.email);

        if (!user) {
            throw new ApiError(
                "Invalid email or password",
                StatusCodes.UNAUTHORIZED,
            );
        }

        const isValidPassword = await passwordService.comparePassword(
            dto.password,
            user.password,
        );

        if (!isValidPassword) {
            throw new ApiError(
                "Invalid email or password",
                StatusCodes.UNAUTHORIZED,
            );
        }

        const tokens = tokenService.generateToken({
            userId: user._id,
            role: user.role,
        });

        await tokenRepository.create({ ...tokens, _userId: user?._id });

        return { user, tokens };
    }
}

export const authService = new AuthService();
