import express from "express";
import { authController } from "../controllers/auth.controller";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import RoleEnum from "../enums/role.enum";
import {
    loginRateLimit,
    setPasswordRateLimit,
    changePasswordRateLimit,
} from "../middleware/rate-limit.middleware";
const authRouter = express.Router();

authRouter.post("/login", loginRateLimit, authController.login);

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
    commonMiddleware.isValidate("userId"),
    authController.activate,
);

authRouter.post("/set-password", setPasswordRateLimit, authController.setPassword);

authRouter.post(
    "/change-password",
    authMiddleware.checkAccessToken,
    changePasswordRateLimit,
    authController.changePassword,
);

authRouter.post(
    "/recovery/:userId",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.isValidate("userId"),
    authController.recoveryPassword,
);

export default authRouter;
