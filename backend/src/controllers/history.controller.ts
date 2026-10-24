import { Request, Response, NextFunction } from "express";
import { historyService } from "../services/history.service";
import StatusCodes from "../enums/status-codes.enum";
import { IHistoryQuery } from "../interfaces/IHistory";

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
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const query = res.locals.query as IHistoryQuery;
            const data = await historyService.getAllHistory(query);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const historyController = new HistoryController();
