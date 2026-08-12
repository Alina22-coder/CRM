import { notificationRepository } from "../repositories/notification.repository";
import { userRepository } from "../repositories/user.repository";
import NotificationEvent from "../enums/notification-event.enum";
import INotification from "../interfaces/INotification";

class NotificationService {
    public async notify(
        userId: string,
        event: NotificationEvent,
        text: string,
        orderId?: string,
    ): Promise<void> {
        await notificationRepository.create({
            user: userId,
            event,
            text,
            order: orderId ?? null,
        });
    }

    public async notifyManagerBySurname(
        surname: string,
        event: NotificationEvent,
        text: string,
        orderId?: string,
    ): Promise<void> {
        const manager = await userRepository.getUserBySurname(surname);

        if (!manager) return;

        await this.notify(manager._id, event, text, orderId);
    }

    public async notifyAdmins(
        event: NotificationEvent,
        text: string,
        excludeUserId?: string,
        orderId?: string,
    ): Promise<void> {
        const admins = await userRepository.getAllAdmins();

        await Promise.all(
            admins
                .filter((admin) => admin._id.toString() !== excludeUserId)
                .map((admin) => this.notify(admin._id, event, text, orderId)),
        );
    }

    public getByUser(
        userId: string,
        page: number,
        pageSize: number,
    ): Promise<{ data: INotification[]; total: number }> {
        return notificationRepository.getByUser(userId, page, pageSize);
    }

    public getUnreadCount(userId: string): Promise<number> {
        return notificationRepository.getUnreadCount(userId);
    }

    public markRead(userId: string, notificationId: string): Promise<void> {
        return notificationRepository.markRead(userId, notificationId);
    }

    public markAllRead(userId: string): Promise<void> {
        return notificationRepository.markAllRead(userId);
    }
}

export const notificationService = new NotificationService();
