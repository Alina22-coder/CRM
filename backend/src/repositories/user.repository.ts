import { UserModel } from "../models/user.model";

class UserRepository {
    public getAllUsers() {
        return UserModel.find();
    }

    public getUserById(userId: string) {
        return UserModel.findById(userId);
    }
}

export const userRepository = new UserRepository();
