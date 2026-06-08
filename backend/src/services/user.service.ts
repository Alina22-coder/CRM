import { userRepository } from "../repositories/user.repository";

class UserService {
    public getAllUsers() {
        return userRepository.getAllUsers();
    }

    public getUserById(userId: string) {
        return userRepository.getUserById(userId);
    }

    // post
    // шукати по email
}

export const userService = new UserService();
