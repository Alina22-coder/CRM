import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import RoleEnum from "../enums/role.enum";
import { overdueSettingsController } from "../controllers/overdue-settings.controller";
import { OverdueSettingsValidator } from "../validators/overdue-settings.validator";

const overdueSettingsRouter = Router();

overdueSettingsRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    overdueSettingsController.getSettings,
);

overdueSettingsRouter.patch(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.validateBody(OverdueSettingsValidator.update),
    overdueSettingsController.updateSettings,
);

export default overdueSettingsRouter;
