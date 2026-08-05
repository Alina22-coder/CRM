import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { historyController } from "../controllers/history.controller";
import RoleEnum from "../enums/role.enum";
import { HistoryValidator } from "../validators/history.validator";

const historyRouter = Router();

historyRouter.get(
    "/",
    authMiddleware.checkAccessToken,
    roleMiddleware.checkRole(RoleEnum.Admin),
    commonMiddleware.query(HistoryValidator.query),
    historyController.getAllHistory,
);

export default historyRouter;
