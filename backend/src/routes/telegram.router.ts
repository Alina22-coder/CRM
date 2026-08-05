import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { commonMiddleware } from "../middleware/common.middleware";
import { telegramController } from "../controllers/telegram.controller";
import { TelegramValidator } from "../validators/telegram.validator";

const telegramRouter = Router();

telegramRouter.get(
    "/status",
    authMiddleware.checkAccessToken,
    telegramController.getStatus,
);

telegramRouter.post(
    "/link-code",
    authMiddleware.checkAccessToken,
    telegramController.getLinkCode,
);

telegramRouter.delete(
    "/link",
    authMiddleware.checkAccessToken,
    telegramController.unlink,
);

telegramRouter.patch(
    "/preferences",
    authMiddleware.checkAccessToken,
    commonMiddleware.validateBody(TelegramValidator.preferences),
    telegramController.updatePreferences,
);

export default telegramRouter;
