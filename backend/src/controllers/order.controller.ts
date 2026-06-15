import { orderService } from "../services/order.service";
import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { IOrderQuery } from "../interfaces/IOrder";
import { ITokenPayload } from "../interfaces/IToken";

class OrderController {
    public async getAllOrders(
        _req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const query = res.locals.query as IOrderQuery;
            const data = await orderService.getAllOrders(query);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await orderService.getOrderById(id);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async updateOrderById(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const id = req.params.id as string;
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const data = await orderService.updateOrderById(
                id,
                req.body,
                userId,
            );
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getStatistic(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await orderService.getStatistic();
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getStatisticByManager(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.params.id as string;
            const data = await orderService.getStatisticByManager(userId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const orderController = new OrderController();
