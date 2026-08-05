import { Request, Response, NextFunction } from "express";
import { telegramService } from "../services/telegram.service";
import StatusCodes from "../enums/status-codes.enum";
import { ITokenPayload } from "../interfaces/IToken";

class TelegramController {
    public async getStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const status = await telegramService.getStatus(userId);
            res.status(StatusCodes.OK).json(status);
        } catch (e) {
            next(e);
        }
    }

    public async getLinkCode(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const code = await telegramService.generateLinkCode(userId);
            res.status(StatusCodes.OK).json({ code });
        } catch (e) {
            next(e);
        }
    }

    public async unlink(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            await telegramService.unlink(userId);
            res.status(StatusCodes.NO_CONTENT).send();
        } catch (e) {
            next(e);
        }
    }

    public async updatePreferences(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            await telegramService.updatePreferences(userId, req.body);
            res.status(StatusCodes.OK).json({ success: true });
        } catch (e) {
            next(e);
        }
    }
}

export const telegramController = new TelegramController();
