import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../controllers/role.middleware";
import RoleEnum from "../enums/role.enum";

const userRouter = Router();

userRouter.get("/", userController.getAllUsers);
userRouter.get("/:id", userController.getUserById);
// userRouter.post("/", userController.createUser);

// userRouter.put(
//     "/:id",
//     authMiddleware.checkAccessToken,
//     commonMiddleware.validateBody(UserValidator.update),
//     userController.updateById,
// );

// userRouter.delete(
//     "/:id",
//     authMiddleware.checkAccessToken,
//     commonMiddleware.isValidate("id"),
//     userController.deleteById,
// );

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

export default userRouter;
