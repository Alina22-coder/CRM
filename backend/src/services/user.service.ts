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

    public async isEmailUnique(email: string): Promise<void> {
        const user = await userRepository.getUserByEmail(email);

        if (user) {
            throw new ApiError("User already exists!", StatusCodes.BAD_REQUEST);
        }
    }
}

export const userService = new UserService();
