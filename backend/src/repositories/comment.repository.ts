import { CommentModel } from "../models/comment.model";

class CommentRepository {
    public createCommentToOrderById(data: any): Promise<any> {
        return CommentModel.create(data);
    }

    public getAllCommentsByOrderId(orderId: string): Promise<any[]> {
        return CommentModel.find({ _orderId: orderId }).populate(
            "_userId",
            "name surname",
        );
    }
}

export const commentRepository = new CommentRepository();
