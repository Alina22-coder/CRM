import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";
import RoleEnum from "../enums/role.enum";
import { orderController } from "../controllers/order.controller";

const userRouter = Router();

userRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.query(UserValidator.query),
    userController.getAllUsers,
);

userRouter.get(
    "/:id/statistic",
    authMiddleware.checkAccessToken,
    orderController.getStatisticByManager,
);

userRouter.get(
    "/:id",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    userController.getUserById,
);

userRouter.post(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.validateBody(UserValidator.create),
    userController.createUser,
);

userRouter.put(
    "/:id",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateBody(UserValidator.update),
    userController.updateUserById,
);

userRouter.patch(
    "/:id/ban",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    userController.banUser,
);

userRouter.patch(
    "/:id/unban",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    userController.unBanUser,
);

userRouter.delete(
    "/:id",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.isValidate("id"),
    userController.deleteUserById,
);

export default userRouter;
