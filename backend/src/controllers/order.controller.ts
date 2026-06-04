import { orderService } from "../services/order.service";
import { Request, Response, NextFunction } from "express";

class OrderController {
  public async getAllOrders(req: Request, res: Response, next: NextFunction) {
    const data = await orderService.getAllOrders();
    res.json(data);
    next();
  }
}

export const orderController = new OrderController();
