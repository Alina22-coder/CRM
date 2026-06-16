import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { groupController } from "../controllers/group.controller";

const groupRouter = Router();

groupRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    groupController.getAllGroups,
);

groupRouter.post(
    "/",
    authMiddleware.checkAccessToken,
    groupController.createGroup,
);

export default groupRouter;
