import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import IUser, { IUserQuery, IUserRegisterDTO } from "../interfaces/IUser";
import { userRepository } from "../repositories/user.repository";

class UserService {
    public getAllUsers(query: IUserQuery) {
        return userRepository.getAllUsers(query);
    }

    public async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        return user;
    }

    public async createUser(user: IUserRegisterDTO) {
        await this.isEmailUnique(user.email);

        try {
            return await userRepository.createUser(user);
        } catch (e) {
            if ((e as { code?: number }).code === 11000) {
                throw new ApiError("User already exists!", StatusCodes.BAD_REQUEST);
            }
            throw e;
        }
    }

    public async updateUserById(userId: string, update: Partial<IUser>) {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        return userRepository.updateUserById(userId, update);
    }

    public deleteUserById(userId: string) {
        return userRepository.deleteUserById(userId);
    }

    public async isEmailUnique(email: string): Promise<void> {
        const user = await userRepository.getUserByEmail(email);

        if (user) {
            throw new ApiError("User already exists!", StatusCodes.BAD_REQUEST);
        }
    }
}

export const userService = new UserService();
