import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service";
import StatusCodes from "../enums/status-codes.enum";
import { ITokenPayload } from "../interfaces/IToken";

class NotificationController {
    public async getNotifications(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const { page, pageSize } = res.locals.query;
            const result = await notificationService.getByUser(
                userId,
                page,
                pageSize,
            );
            res.status(StatusCodes.OK).json(result);
        } catch (e) {
            next(e);
        }
    }

    public async getUnreadCount(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const count = await notificationService.getUnreadCount(userId);
            res.status(StatusCodes.OK).json({ count });
        } catch (e) {
            next(e);
        }
    }

    public async markRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            await notificationService.markRead(
                userId,
                req.params.notificationId as string,
            );
            res.status(StatusCodes.OK).json({ success: true });
        } catch (e) {
            next(e);
        }
    }

    public async markAllRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            await notificationService.markAllRead(userId);
            res.status(StatusCodes.OK).json({ success: true });
        } catch (e) {
            next(e);
        }
    }
}

export const notificationController = new NotificationController();
