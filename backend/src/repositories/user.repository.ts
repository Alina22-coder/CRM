import IUser, { IUserQuery } from "../interfaces/IUser";
import { UserModel } from "../models/user.model";

class UserRepository {
    public async getAllUsers(
        query: IUserQuery,
    ): Promise<{ data: IUser[]; total: number }> {
        const { page, pageSize, search, order, excludeId } = query;
        const filter: Record<string, any> = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: "i" } },
                      { email: { $regex: search, $options: "i" } },
                  ],
              }
            : {};

        if (excludeId) {
            filter._id = { $ne: excludeId };
        }
        const sortField = order?.startsWith("-") ? order.slice(1) : order;
        const sortDir = order?.startsWith("-") ? -1 : 1;

        const [data, total] = await Promise.all([
            UserModel.find(filter)
                .sort(sortField ? { [sortField]: sortDir } : { _id: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize),
            UserModel.countDocuments(filter),
        ]);

        return { data, total };
    }

    public getUserById(userId: string): Promise<IUser | null> {
        return UserModel.findById(userId);
    }

    public createUser(user: Partial<IUser>): Promise<IUser> {
        return UserModel.create(user);
    }

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
