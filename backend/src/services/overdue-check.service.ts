import { orderRepository } from "../repositories/order.repository";
import { commentRepository } from "../repositories/comment.repository";
import { overdueSettingsRepository } from "../repositories/overdue-settings.repository";
import { telegramService } from "./telegram.service";
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
                await telegramService.notifyManagerBySurname(
                    order.manager,
                    NotificationEvent.ORDER_OVERDUE,
                    text,
                );
            }

            await telegramService.notifyAdmins(
                NotificationEvent.ORDER_OVERDUE,
                text,
            );
        }
    }

    public getOverdueCount() {
        return orderRepository.getOverdueCount();
    }
}

export const overdueCheckService = new OverdueCheckService();
