import INotification from "../interfaces/INotification";
import { NotificationModel } from "../models/notification.model";
import NotificationEvent from "../enums/notification-event.enum";

class NotificationRepository {
    public create(data: {
        user: string;
        event: NotificationEvent;
        text: string;
        order?: string | null;
    }): Promise<INotification> {
        return NotificationModel.create(data);
    }

    public async getByUser(
        userId: string,
        page: number,
        pageSize: number,
    ): Promise<{ data: INotification[]; total: number }> {
        const query = { user: userId };

        const [data, total] = await Promise.all([
            NotificationModel.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize),
            NotificationModel.countDocuments(query),
        ]);

        return { data, total };
    }

    public getUnreadCount(userId: string): Promise<number> {
        return NotificationModel.countDocuments({ user: userId, read: false });
    }

    public async markRead(userId: string, notificationId: string): Promise<void> {
        await NotificationModel.updateOne(
            { _id: notificationId, user: userId },
            { read: true },
        );
    }

    public async markAllRead(userId: string): Promise<void> {
        await NotificationModel.updateMany(
            { user: userId, read: false },
            { read: true },
        );
    }

    public deleteAllByUser(userId: string): Promise<unknown> {
        return NotificationModel.deleteMany({ user: userId });
    }
}

export const notificationRepository = new NotificationRepository();
