import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.get("/", orderController.getAllOrders);

export default orderRouter;
