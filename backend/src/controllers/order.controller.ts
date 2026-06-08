import { orderService } from "../services/order.service";
import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";

class OrderController {
    public async getAllOrders(req: Request, res: Response, next: NextFunction) {
        const data = await orderService.getAllOrders();
        res.status(StatusCodes.OK).json(data);
        next();
    }

    public async getOrderById(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id as string;
        const data = await orderService.getOrderById(id);
        res.status(StatusCodes.OK).json(data);
        next();
    }
}

export const orderController = new OrderController();
