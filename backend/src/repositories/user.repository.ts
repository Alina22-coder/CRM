import IUser, { IUserQuery } from "../interfaces/IUser";
import { UserModel } from "../models/user.model";

class UserRepository {
    public async getAllUsers(query: IUserQuery): Promise<IUser[]> {
        const { page, pageSize, search, order } = query;
        const filter = search
            ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
            : {};
        const sortField = order?.startsWith("-") ? order.slice(1) : order;
        const sortDir = order?.startsWith("-") ? -1 : 1;
        const q = UserModel.find(filter);
        if (sortField) q.sort({ [sortField]: sortDir });
        return q.skip((page - 1) * pageSize).limit(pageSize);
    }

    public getUserById(userId: string): Promise<IUser | null> {
        return UserModel.findById(userId);
    }

    public createUser(user: Partial<IUser>): Promise<IUser> {
        return UserModel.create(user);
    }

    // public updateUserById(userId: string): Promise<IUser | null> {
    //     return UserModel.findByIdAndUpdate(userId);
    // }

    public updateUserById(
        userId: string,
        update: Partial<IUser>,
    ): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(userId, update, { new: true });
    }

    public deleteUserById(userId: string): Promise<IUser | null> {
        return UserModel.findByIdAndDelete(userId);
    }

    public getUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }
}

export const userRepository = new UserRepository();
