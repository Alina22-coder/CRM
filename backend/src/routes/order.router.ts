import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { commonMiddleware } from "../middleware/common.middleware.js";
import { OrderValidator } from "../validators/order.validator.js";
import { commentController } from "../controllers/comment.controller.js";
import { CommentValidator } from "../validators/comment.validator.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import RoleEnum from "../enums/role.enum.js";
import { historyController } from "../controllers/history.controller.js";

const orderRouter = Router();

orderRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    commonMiddleware.query(OrderValidator.query),
    orderController.getAllOrders,
);

orderRouter.post(
    "/",
    commonMiddleware.validateBody(OrderValidator.create),
    orderController.createOrder,
);

orderRouter.get(
    "/statistic",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    orderController.getOrderStatistic,
);

orderRouter.get(
    "/loss-report",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.query(OrderValidator.lossReportQuery),
    orderController.getLossReport,
);

orderRouter.get(
    "/excel",
    authMiddleware.checkAccessToken,
    commonMiddleware.query(OrderValidator.query),
    orderController.getAllOrdersForExcel,
);

orderRouter.get(
    "/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("id"),
    orderController.getOrderById,
);

orderRouter.patch(
    "/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("id"),
    commonMiddleware.validateBody(OrderValidator.update),
    orderController.updateOrderById,
);

orderRouter.post(
    "/:id/comments",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("id"),
    commonMiddleware.validateBody(CommentValidator.create),
    commentController.createCommentToOrderById,
);

orderRouter.get(
    "/:id/history",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("id"),
    historyController.getAllHistoryByOrderId,
);

export default orderRouter;
