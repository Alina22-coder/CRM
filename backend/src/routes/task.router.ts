import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { taskController } from "../controllers/task.controller";

const taskRouter = Router();

taskRouter.get(
    "/my",
    authMiddleware.checkAccessToken,
    taskController.getMyTasks,
);

taskRouter.patch(
    "/:taskId/done",
    authMiddleware.checkAccessToken,
    commonMiddleware.isValidate("taskId"),
    taskController.markDone,
);

export default taskRouter;
