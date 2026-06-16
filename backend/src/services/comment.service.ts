import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import IComment from "../interfaces/IComment";
import Status from "../enums/status.enum";
import { commentRepository } from "../repositories/comment.repository";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import IOrder from "../interfaces/IOrder";

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

        if (order.manager && order.manager !== user.surname) {
            throw new ApiError(
                "You can only comment your own orders",
                StatusCodes.FORBIDDEN,
            );
        }

        const comment = await commentRepository.createCommentToOrderById({
            text,
            _orderId: orderId,
            _userId: userId,
        });

        const update: Partial<IOrder> = {};

        if (!order.manager) {
            update.manager = user.surname || user.name || user.email;
        }
        if (!order.status || order.status === Status.NEW) {
            update.status = Status.IN_WORK;
        }

        if (Object.keys(update).length) {
            await orderRepository.updateOrderById(orderId, update);
        }

        return comment;
    }
}

export const commentService = new CommentService();
