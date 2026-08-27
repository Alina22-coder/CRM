import IUser, { IUserQuery } from "../interfaces/IUser";
import { UserModel } from "../models/user.model";
import RoleEnum from "../enums/role.enum";

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

    public getUserByIdWithPassword(userId: string): Promise<IUser | null> {
        return UserModel.findById(userId).select("+password");
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

    public getUserByEmail(email: string) {
        return UserModel.findOne({ email }).select("+password");
    }

    public getUserByTelegramChatId(chatId: string): Promise<IUser | null> {
        return UserModel.findOne({ telegram_chat_id: chatId });
    }

    public unsetTelegramChatId(userId: string): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            { $unset: { telegram_chat_id: 1 } },
            { new: true },
        );
    }

    public getUserBySurname(surname: string): Promise<IUser | null> {
        return UserModel.findOne({ surname });
    }

    public getAdminsWithTelegram(): Promise<IUser[]> {
        return UserModel.find({
            role: RoleEnum.Admin,
            telegram_chat_id: { $ne: null },
        });
    }

    public getAllAdmins(): Promise<IUser[]> {
        return UserModel.find({ role: RoleEnum.Admin });
    }
}

export const userRepository = new UserRepository();
