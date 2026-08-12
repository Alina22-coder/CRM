import { Router } from "express";
import { Request, Response } from "express";
import authRouter from "./auth.router.js";
import orderRouter from "./order.router.js";
import userRouter from "./user.router.js";
import groupRouter from "./group.router.js";
import { swaggerDocument, swaggerUI } from "../config/swagger.config.js";
import historyRouter from "./history.router.js";
import telegramRouter from "./telegram.router.js";
import autoAssignRouter from "./auto-assign.router.js";
import overdueSettingsRouter from "./overdue-settings.router.js";
import taskRouter from "./task.router.js";
import notificationRouter from "./notification.router.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("CRM working");
});

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/orders", orderRouter);

router.use("/groups", groupRouter);

router.use("/history", historyRouter);

router.use("/telegram", telegramRouter);

router.use("/auto-assign", autoAssignRouter);

router.use("/overdue-settings", overdueSettingsRouter);

router.use("/tasks", taskRouter);

router.use("/notifications", notificationRouter);

router.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

export default router;
