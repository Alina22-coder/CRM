import { ITokenPair } from "../interfaces/IToken";
import IUser, { IUserLoginDTO } from "../interfaces/IUser";
import RoleEnum from "../enums/role.enum";
import { passwordService } from "./password.service";
import { userRepository } from "../repositories/user.repository";
import { tokenService } from "./token.service";
import { tokenRepository } from "../repositories/token.repository";
import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";

class AuthService {
    public async login(
        dto: IUserLoginDTO,
    ): Promise<{ user: Omit<IUser, "password">; tokens: ITokenPair }> {
        const user = await userRepository.getUserByEmail(dto.email);

        const isValidPassword =
            !!user?.password &&
            (await passwordService.comparePassword(
                dto.password,
                user.password,
            ));

        if (!user || !isValidPassword) {
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

        const tokens = tokenService.generateToken({
            userId: user._id,
            role: user.role,
        });

        await Promise.all([
            tokenRepository.create({ ...tokens, _userId: user._id }),
            userRepository.updateUserById(user._id, { last_login: new Date() }),
        ]);

        const { password, ...userWithoutPassword } = user.toObject();

        return { user: userWithoutPassword, tokens };
    }

    public async refresh(
        userId: string,
        role: RoleEnum,
        refreshToken: string,
    ): Promise<ITokenPair> {
        const user = await userRepository.getUserById(userId);

        if (!user || user.is_banned) {
            await tokenRepository.deleteAllByUserId(userId);
            throw new ApiError("User is banned", StatusCodes.FORBIDDEN);
        }

        await tokenRepository.deleteByParams({ refreshToken });
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
            tokenVersion: user.tokenVersion,
        });

        return token;
    }

    public async setPassword(token: string, password: string): Promise<void> {
        const payload = tokenService.verifyActivateToken(token);

        const user = await userRepository.getUserById(payload.userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            throw new ApiError(
                "Invalid or expired token",
                StatusCodes.UNAUTHORIZED,
            );
        }

        const hashedPassword = await passwordService.hashPassword(password);

        await userRepository.updateUserById(payload.userId, {
            password: hashedPassword,
            tokenVersion: user.tokenVersion + 1,
            ...(payload.isActivation && { is_active: true }),
        });
        await tokenRepository.deleteAllByUserId(payload.userId);
    }

    public async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<void> {
        const user = await userRepository.getUserByIdWithPassword(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const isValidPassword = await passwordService.comparePassword(
            currentPassword,
            user.password,
        );

        if (!isValidPassword) {
            throw new ApiError(
                "Current password is incorrect",
                StatusCodes.UNAUTHORIZED,
            );
        }

        const hashedPassword = await passwordService.hashPassword(newPassword);

        await userRepository.updateUserById(userId, {
            password: hashedPassword,
            tokenVersion: user.tokenVersion + 1,
        });
        await tokenRepository.deleteAllByUserId(userId);
    }

    public async recoveryPassword(userId: string): Promise<string> {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const token = tokenService.generateActivateToken({
            userId: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion,
        });

        return token;
    }
}

export const authService = new AuthService();
