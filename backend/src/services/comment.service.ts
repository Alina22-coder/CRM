import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import IComment from "../interfaces/IComment";
import IOrder from "../interfaces/IOrder";
import Status from "../enums/status.enum";
import { commentRepository } from "../repositories/comment.repository";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import { applyAutoAssignDefaults } from "../helpers/applyAutoAssignDefaults";
import { getManagerId } from "../helpers/getManagerId";
import { historyService } from "./history.service";
import { telegramService } from "./telegram.service";
import { notificationService } from "./notification.service";
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
        const statusChanging =
            !!statusUpdate?.status && statusUpdate.status !== order.status;

        if (statusChanging) {
            update.status = statusUpdate!.status;

            if (statusUpdate!.status === Status.DISAGREE) {
                update.disagree_reason = statusUpdate!.disagree_reason ?? null;
                update.disagree_reason_comment =
                    statusUpdate!.disagree_reason_comment ?? null;
                update.disagree_at = new Date();
            } else {
                update.disagree_reason = null;
                update.disagree_reason_comment = null;
                update.disagree_at = null;
            }

            update.status_updated_at = new Date();
            update.is_overdue = false;
        } else if (order.is_overdue) {
            update.is_overdue = false;
        }

        const resultingStatus = update.status ?? order.status;
        const resultingReason = statusChanging
            ? update.disagree_reason
            : update.disagree_reason ?? order.disagree_reason;

        if (resultingStatus === Status.DISAGREE && !resultingReason) {
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

        const managerId = getManagerId(update.manager ?? order.manager);
        const statusChanged = update.status && update.status !== order.status;
        const notificationText = statusChanged
            ? `Order status for ${order.name} ${order.surname}: ${order.status} → ${update.status}`
            : `New comment on order ${order.name} ${order.surname}`;
        const notificationEvent = statusChanged
            ? NotificationEvent.STATUS_CHANGE
            : NotificationEvent.COMMENT_ADDED;

        if (managerId && managerId !== String(user._id)) {
            await telegramService.notifyManagerById(
                managerId,
                notificationEvent,
                notificationText,
            );
            await notificationService.notifyManagerById(
                managerId,
                notificationEvent,
                notificationText,
                orderId,
            );
        }

        await telegramService.notifyAdmins(
            notificationEvent,
            notificationText,
            userId,
        );
        await notificationService.notifyAdmins(
            notificationEvent,
            notificationText,
            userId,
            orderId,
        );

        return comment;
    }
}

export const commentService = new CommentService();
