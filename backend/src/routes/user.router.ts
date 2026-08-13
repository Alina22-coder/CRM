import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";
import RoleEnum from "../enums/role.enum";
import { orderController } from "../controllers/order.controller";
import { avatarUpload } from "../config/upload.config";

const userRouter = Router();

userRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.query(UserValidator.query),
    userController.getAllUsers,
);

userRouter.post(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.validateBody(UserValidator.create),
    userController.createUser,
);

userRouter.get(
    "/:id",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.isValidate("id"),
    userController.getUserById,
);

userRouter.put(
    "/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("id"),
    commonMiddleware.validateBody(UserValidator.update),
    userController.updateUserById,
);

userRouter.post(
    "/:id/avatar",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("id"),
    avatarUpload.single("avatar"),
    userController.updateAvatar,
);

userRouter.patch(
    "/:id/ban",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.isValidate("id"),
    userController.banUser,
);

userRouter.patch(
    "/:id/unban",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.isValidate("id"),
    userController.unBanUser,
);

userRouter.delete(
    "/:id",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.isValidate("id"),
    userController.deleteUserById,
);

userRouter.get(
    "/:id/statistic",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("id"),
    orderController.getStatisticByManager,
);

export default userRouter;
