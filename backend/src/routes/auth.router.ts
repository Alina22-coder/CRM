import express from "express";
import { authController } from "../controllers/auth.controller";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../controllers/role.middleware";
import RoleEnum from "../enums/role.enum";
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

authRouter.post(
    "/activate/:userId",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    authController.activate,
);

authRouter.post("/set-password", authController.setPassword);

authRouter.post(
    "/recovery/:userId",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    authController.recoveryPassword,
);

export default authRouter;
