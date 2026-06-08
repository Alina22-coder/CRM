import express from "express";
import { authController } from "../controllers/auth.controller";
import { commonMiddleware } from "../middleware/common.middleware";
import { UserValidator } from "../validators/user.validator";

const authRouter = express.Router();

authRouter.get("/", (req, res) => {
    res.send("Auth route working");
});

authRouter.post(
    "/register",
    commonMiddleware.validateBody(UserValidator.register),
    authController.register,
);
authRouter.post("/login", authController.login);

export default authRouter;
