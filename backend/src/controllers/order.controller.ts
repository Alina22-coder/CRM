import { orderService } from "../services/order.service";
import { Request, Response, NextFunction } from "express";
import StatusCodes from "../enums/status-codes.enum";
import { userService } from "../services/user.service";

class OrderController {
    public async getAllOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await orderService.getAllOrders();
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

    public async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.body;
            const data = await userService.createUser(user);
            res.status(StatusCodes.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const orderController = new OrderController();
