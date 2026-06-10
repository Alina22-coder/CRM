import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import IUser from "../interfaces/IUser";
import { userRepository } from "../repositories/user.repository";

class UserService {
    public getAllUsers() {
        return userRepository.getAllUsers();
    }

    public getUserById(userId: string) {
        return userRepository.getUserById(userId);
    }

    public createUser(user: Partial<IUser>) {
        return userRepository.createUser(user);
    }

    public updateUserById(userId: string, update: Partial<IUser>) {
        return userRepository.updateUserById(userId, update);
    }

    public async updateUserBanById(userId: string, update: Partial<IUser>) {
        const user = await userRepository.getUserById(userId);

        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        await userRepository.updateUserById(userId, update);
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
