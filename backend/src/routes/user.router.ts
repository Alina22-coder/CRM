import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";

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

export default userRouter;
