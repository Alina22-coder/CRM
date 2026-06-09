import express from "express";
import { authController } from "../controllers/auth.controller";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = express.Router();

authRouter.get("/", (req, res) => {
    res.send("Auth route working");
});

authRouter.post(
    "/register",
    commonMiddleware.validateBody(UserValidator.register),
    authController.register,
);
authRouter.post("/login", authController.login, authController.refresh);

authRouter.post("/refresh", authMiddleware.checkRefreshToken);

export default authRouter;
 