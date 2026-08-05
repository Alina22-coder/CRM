import { Request, Response, NextFunction } from "express";
import { historyService } from "../services/history.service";
import StatusCodes from "../enums/status-codes.enum";

class HistoryController {
    public async getAllHistoryByOrderId(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const orderId = req.params.id as string;
            const data = await historyService.getAllHistoryByOrderId(orderId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getAllHistory(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const data = await historyService.getAllHistory(req.query as any);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const historyController = new HistoryController();
