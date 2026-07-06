import StatusCodes from "../enums/status-codes.enum";
import ApiError from "../errors/api.error";
import IComment from "../interfaces/IComment";
import { commentRepository } from "../repositories/comment.repository";
import { orderRepository } from "../repositories/order.repository";
import { userRepository } from "../repositories/user.repository";
import { applyAutoAssignDefaults } from "../helpers/applyAutoAssignDefaults";

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
        }

        return comment;
    }
}

export const commentService = new CommentService();
