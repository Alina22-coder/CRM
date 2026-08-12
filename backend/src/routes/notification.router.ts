import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { notificationController } from "../controllers/notification.controller";
import { NotificationValidator } from "../validators/notification.validator";

const notificationRouter = Router();

notificationRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    commonMiddleware.query(NotificationValidator.query),
    notificationController.getNotifications,
);

notificationRouter.get(
    "/unread-count",
    authMiddleware.checkAccessToken,
    notificationController.getUnreadCount,
);

notificationRouter.patch(
    "/read-all",
    authMiddleware.checkAccessToken,
    notificationController.markAllRead,
);

notificationRouter.patch(
    "/:notificationId/read",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("notificationId"),
    notificationController.markRead,
);

export default notificationRouter;
