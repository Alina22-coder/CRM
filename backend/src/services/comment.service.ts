import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import IComment from "../interfaces/IComment";
import IOrder from "../interfaces/IOrder";
import Status from "../enums/status.enum";
import { commentRepository } from "../repositories/comment.repository";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import { applyAutoAssignDefaults } from "../helpers/applyAutoAssignDefaults";
import { historyService } from "./history.service";
import { telegramService } from "./telegram.service";
import NotificationEvent from "../enums/notification-event.enum";

type StatusUpdate = Pick<
    IOrder,
    "status" | "disagree_reason" | "disagree_reason_comment"
>;

class CommentService {
    public async createCommentToOrderById(
        orderId: string,
        userId: string,
        text: string,
        statusUpdate?: Partial<StatusUpdate>,
    ): Promise<IComment> {
        const order = await orderRepository.getOrderById(orderId);
        if (!order) {
            throw new ApiError("Order not found", StatusCodes.NOT_FOUND);
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new ApiError("User not found", StatusCodes.NOT_FOUND);
        }

        const autoUpdate = applyAutoAssignDefaults(order, user, "comment");

        const update: Partial<IOrder> = { ...autoUpdate };

        if (statusUpdate?.status) {
            update.status = statusUpdate.status;
            update.disagree_reason = statusUpdate.disagree_reason ?? null;
            update.disagree_reason_comment =
                statusUpdate.disagree_reason_comment ?? null;
        }

        const resultingStatus = update.status ?? order.status;
        const resultingReason = update.disagree_reason ?? order.disagree_reason;

        if (resultingStatus === Status.DISAGGRE && !resultingReason) {
            throw new ApiError(
                "Disagree reason is required when status is Disagree",
                StatusCodes.BAD_REQUEST,
            );
        }

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
        const statusChanged = update.status && update.status !== order.status;
        const notificationText = statusChanged
            ? `Order status for ${order.name} ${order.surname}: ${order.status} → ${update.status}`
            : `New comment on order ${order.name} ${order.surname}`;
        const notificationEvent = statusChanged
            ? NotificationEvent.STATUS_CHANGE
            : NotificationEvent.COMMENT_ADDED;

        if (managerSurname && managerSurname !== user.surname) {
            await telegramService.notifyManagerBySurname(
                managerSurname,
                notificationEvent,
                notificationText,
            );
        }

        await telegramService.notifyAdmins(
            notificationEvent,
            notificationText,
            userId,
        );

        return comment;
    }
}

export const commentService = new CommentService();
