import express from "express";
import { authController } from "../controllers/auth.controller";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = express.Router();

authRouter.post(
    "/register",
    commonMiddleware.validateBody(UserValidator.register),
    authController.register,
);

authRouter.post("/login", authController.login);

authRouter.post(
    "/refresh",
    authMiddleware.checkRefreshToken,
    authController.refresh,
);

authRouter.delete(
    "/logout",
    authMiddleware.checkAccessToken,
    authController.logout,
);

export default authRouter;
