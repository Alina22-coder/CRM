import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import RoleEnum from "../enums/role.enum";
import { autoAssignController } from "../controllers/auto-assign.controller";
import { AutoAssignValidator } from "../validators/auto-assign.validator";

const autoAssignRouter = Router();

autoAssignRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    autoAssignController.getSettings,
);

autoAssignRouter.patch(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.validateBody(AutoAssignValidator.update),
    autoAssignController.updateSettings,
);

export default autoAssignRouter;
