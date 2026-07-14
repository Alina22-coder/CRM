import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { groupController } from "../controllers/group.controller";
import { GroupValidator } from "../validators/group.validator";

const groupRouter = Router();

groupRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    groupController.getAllGroups,
);

groupRouter.post(
    "/",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateBody(GroupValidator.create),
    groupController.createGroup,
);

export default groupRouter;
