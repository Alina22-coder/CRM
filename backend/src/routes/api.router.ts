import { Router } from "express";
import { Request, Response } from "express";
import authRouter from "./auth.router.js";
import orderRouter from "./order.router.js";
import userRouter from "./user.router.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("CRM working");
});

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/orders", orderRouter);

export default router;
