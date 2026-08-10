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

    public hasAnyComment(orderId: string): Promise<boolean> {
        return CommentModel.exists({ _orderId: orderId }).then(Boolean);
    }
}

export const commentRepository = new CommentRepository();
