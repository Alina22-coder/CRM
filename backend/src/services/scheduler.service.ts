import cron from "node-cron";
import { overdueCheckService } from "./overdue-check.service";
import { taskService } from "./task.service";
import { logger } from "../config/logger";

export const startScheduler = (): void => {
    cron.schedule("*/15 * * * *", () => {
        overdueCheckService.checkOverdueOrders(new Date()).catch((e) => {
            logger.error("overdue check failed", e);
        });
    });

    cron.schedule("* * * * *", () => {
        taskService.checkDueReminders(new Date()).catch((e) => {
            logger.error("task reminder check failed", e);
        });
    });
};
