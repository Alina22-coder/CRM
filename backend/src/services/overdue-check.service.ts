import { orderRepository } from "../repositories/order.repository";
import { commentRepository } from "../repositories/comment.repository";
import { overdueSettingsRepository } from "../repositories/overdue-settings.repository";
import { telegramService } from "./telegram.service";
import { notificationService } from "./notification.service";
import NotificationEvent from "../enums/notification-event.enum";

class OverdueCheckService {
    public async checkOverdueOrders(now: Date): Promise<void> {
        const settings = await overdueSettingsRepository.getSettings();

        if (!settings.enabled) return;

        const cutoff = new Date(
            now.getTime() - settings.thresholdHours * 60 * 60 * 1000,
        );

        const candidates = await orderRepository.getNewOrdersOlderThan(cutoff);

        for (const order of candidates) {
            const hasComment = await commentRepository.hasAnyComment(
                order._id.toString(),
            );

            if (hasComment) continue;

            await orderRepository.markOverdue(order._id.toString());

            const text = `Order overdue: ${order.name} ${order.surname} has been New for more than ${settings.thresholdHours}h without a comment.`;

            if (order.manager) {
                await telegramService.notifyManagerById(
                    String(order.manager),
                    NotificationEvent.ORDER_OVERDUE,
                    text,
                );
                await notificationService.notifyManagerById(
                    String(order.manager),
                    NotificationEvent.ORDER_OVERDUE,
                    text,
                    order._id.toString(),
                );
            }

            await telegramService.notifyAdmins(
                NotificationEvent.ORDER_OVERDUE,
                text,
            );
            await notificationService.notifyAdmins(
                NotificationEvent.ORDER_OVERDUE,
                text,
                undefined,
                order._id.toString(),
            );
        }
    }

    public getOverdueCount() {
        return orderRepository.getOverdueCount();
    }
}

export const overdueCheckService = new OverdueCheckService();
