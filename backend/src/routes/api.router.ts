import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import authRouter from "./auth.router.js";
import orderRouter from "./order.router.js";
import { commonMiddleware } from "../middleware/common.middleware.js";
import { UserValidator } from "../validators/user.validator.js";
import userRouter from "./user.router.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("CRM working");
});

router.use("/users", userRouter);

router.use("/orders", orderRouter);

router.use(
    "/auth",
    commonMiddleware.validateBody(UserValidator.register),
    authRouter,
);

export default router;
