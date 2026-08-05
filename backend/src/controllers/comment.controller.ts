import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { commentService } from "../services/comment.service";

class CommentController {
    public async createCommentToOrderById(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const orderId = req.params.id as string;

            const { userId } = res.locals.tokenPayload;

            const { text, status, disagree_reason, disagree_reason_comment } =
                req.body;

            const data = await commentService.createCommentToOrderById(
                orderId,
                userId,
                text,
                { status, disagree_reason, disagree_reason_comment },
            );

            res.status(StatusCodes.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const commentController = new CommentController();
