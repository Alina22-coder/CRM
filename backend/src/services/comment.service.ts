import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import IComment from "../interfaces/IComment";
import { commentRepository } from "../repositories/comment.repository";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import { applyAutoAssignDefaults } from "../helpers/applyAutoAssignDefaults";
import { historyService } from "./history.service";
import { telegramService } from "./telegram.service";
import NotificationEvent from "../enums/notification-event.enum";

class CommentService {
    public async createCommentToOrderById(
        orderId: string,
        userId: string,
        text: string,
    ): Promise<IComment> {
        const order = await orderRepository.getOrderById(orderId);
        if (!order) {
            throw new ApiError("Order not found", StatusCodes.NOT_FOUND);
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const update = applyAutoAssignDefaults(order, user, "comment");

        const comment = await commentRepository.createCommentToOrderById({
            text,
            _orderId: orderId,
            _userId: userId,
        });

        if (Object.keys(update).length) {
            await orderRepository.updateOrderById(orderId, update);
            await historyService.logOrderChanges(
                orderId,
                userId,
                order.toObject(),
                update,
            );
        }

        await historyService.logCommentAdded(orderId, userId);

        const managerSurname = update.manager ?? order.manager;
        const notificationText = `New comment on order ${order.name} ${order.surname}`;

        if (managerSurname && managerSurname !== user.surname) {
            await telegramService.notifyManagerBySurname(
                managerSurname,
                NotificationEvent.COMMENT_ADDED,
                notificationText,
            );
        }

        await telegramService.notifyAdmins(
            NotificationEvent.COMMENT_ADDED,
            notificationText,
            userId,
        );

        return comment;
    }
}

export const commentService = new CommentService();
