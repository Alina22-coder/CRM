import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { commonMiddleware } from "../middleware/common.middleware.js";
import { OrderValidator } from "../validators/order.validator.js";

const orderRouter = Router();

orderRouter.get("/", authMiddleware.checkAccessToken, commonMiddleware.query(OrderValidator.query), orderController.getAllOrders);
orderRouter.get("/:id", authMiddleware.checkAccessToken, orderController.getOrderById);

export default orderRouter;
