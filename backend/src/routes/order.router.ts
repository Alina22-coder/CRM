import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.get("/", orderController.getAllOrders);
orderRouter.get("/:id", orderController.getOrderById);

export default orderRouter;
