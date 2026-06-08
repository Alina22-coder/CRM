import IUser from "../interfaces/IUser";
import { UserModel } from "../models/user.model";

class UserRepository {
    public getAllUsers(): Promise<IUser[]> {
        return UserModel.find();
    }

    public getUserById(userId: string): Promise<IUser | null> {
        return UserModel.findById(userId);
    }

    public createUser(user: Partial<IUser>): Promise<IUser> {
        return UserModel.create(user);
    }

    public getUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }
}

export const userRepository = new UserRepository();
