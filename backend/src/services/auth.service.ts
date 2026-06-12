import { ITokenPair } from "../interfaces/IToken";
import IUser, { IUserLoginDTO, IUserRegisterDTO } from "../interfaces/IUser";
import RoleEnum from "../enums/role.enum";
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
        dto: IUserLoginDTO,
    ): Promise<{ user: IUser; tokens: ITokenPair }> {
        const user = await userRepository.getUserByEmail(dto.email);

        if (!user) {
            throw new ApiError(
                "Invalid email or password",
                StatusCodes.UNAUTHORIZED,
            );
        }

        if (user.is_banned) {
            throw new ApiError("User is banned", StatusCodes.FORBIDDEN);
        }
        if (!user.is_active) {
            throw new ApiError("User is not activate", StatusCodes.FORBIDDEN);
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

    public async refresh(userId: string, role: RoleEnum): Promise<ITokenPair> {
        const tokens = tokenService.generateToken({ userId, role });
        await tokenRepository.create({ ...tokens, _userId: userId });
        return tokens;
    }

    public async logout(accessToken: string): Promise<void> {
        await tokenRepository.deleteByParams({ accessToken });
    }

    public async activate(userId: string): Promise<string> {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const token = tokenService.generateActivateToken({
            userId: user._id,
            role: user.role,
            isActivation: true,
        });

        return token;
    }

    public async setPassword(token: string, password: string): Promise<void> {
        const payload = tokenService.verifyActivateToken(token);
        const hashedPassword = await passwordService.hashPassword(password);

        await userRepository.updateUserById(payload.userId, {
            password: hashedPassword,
            ...(payload.isActivation && { is_active: true }),
        });
    }

    public async recoveryPassword(userId: string): Promise<string> {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const token = tokenService.generateActivateToken({
            userId: user._id,
            role: user.role,
        });

        return token;
    }
}

export const authService = new AuthService();
