import ApiError from "../errors/api.error";
import StatusCodes from "../enums/status-codes.enum";
import ITask from "../interfaces/ITask";
import { taskRepository } from "../repositories/task.repository";
import { orderRepository } from "../repositories/order.repository";
import { telegramService } from "./telegram.service";
import { notificationService } from "./notification.service";
import NotificationEvent from "../enums/notification-event.enum";

class TaskService {
    public async createTask(
        orderId: string,
        assigneeId: string,
        title: string,
        dueDate: string,
    ): Promise<ITask> {
        const order = await orderRepository.getOrderById(orderId);

        if (!order) {
            throw new ApiError("Order not found", StatusCodes.NOT_FOUND);
        }

        return taskRepository.createTask({
            title,
            order: orderId,
            assignee: assigneeId,
            dueDate: new Date(dueDate) as unknown as string,
            statusAtCreation: order.status,
        } as any);
    }

    public getAllTasksByOrderId(orderId: string) {
        return taskRepository.getAllTasksByOrderId(orderId);
    }

    public getMyTasks(userId: string) {
        return taskRepository.getAllTasksByAssigneeId(userId);
    }

    public markDone(taskId: string) {
        return taskRepository.markDone(taskId);
    }

    public async checkDueReminders(now: Date): Promise<void> {
        const dueTasks = await taskRepository.getDueUnremindedTasks(now);

        for (const task of dueTasks) {
            const order = task.order as unknown as {
                _id: string;
                name: string;
                surname: string;
                status: string;
            };
            const assignee = task.assignee as unknown as { _id: string };

            if (order.status === task.statusAtCreation) {
                const text = `Reminder: task "${task.title}" for order ${order.name} ${order.surname} is due, and the order status hasn't changed.`;

                await telegramService.notify(
                    assignee._id,
                    NotificationEvent.TASK_REMINDER,
                    text,
                );
                await notificationService.notify(
                    assignee._id,
                    NotificationEvent.TASK_REMINDER,
                    text,
                    order._id,
                );
            }

            await taskRepository.markReminderSent(task._id.toString());
        }
    }
}

export const taskService = new TaskService();
