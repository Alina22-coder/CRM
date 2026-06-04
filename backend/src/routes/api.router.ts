import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import authRouter from "./auth.router.js";
import orderRouter from "./order.router.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("CRM working");
});

router.use("/orders", orderRouter);
router.use("/auth", authRouter);

export default router;
