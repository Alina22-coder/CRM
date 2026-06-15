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

            const { text } = req.body;

            const data = await commentService.createCommentToOrderById(
                orderId,
                userId,
                text,
            );

            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const commentController = new CommentController();
