import cron from "node-cron";
import { overdueCheckService } from "./overdue-check.service";
import { taskService } from "./task.service";

export const startScheduler = (): void => {
    cron.schedule("*/15 * * * *", () => {
        overdueCheckService.checkOverdueOrders(new Date()).catch((e) => {
            console.log("overdue check failed", e);
        });
    });

    cron.schedule("* * * * *", () => {
        taskService.checkDueReminders(new Date()).catch((e) => {
            console.log("task reminder check failed", e);
        });
    });
};
