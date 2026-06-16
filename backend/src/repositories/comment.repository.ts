import IComment, { ICommentDto } from "../interfaces/IComment";
import { CommentModel } from "../models/comment.model";

class CommentRepository {
    public createCommentToOrderById(data: ICommentDto): Promise<IComment> {
        return CommentModel.create(data);
    }

    public getAllCommentsByOrderId(orderId: string): Promise<IComment[]> {
        return CommentModel.find({ _orderId: orderId }).populate(
            "_userId",
            "name surname",
        );
    }
}

export const commentRepository = new CommentRepository();
