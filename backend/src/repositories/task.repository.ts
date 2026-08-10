import ITask, { ITaskDto } from "../interfaces/ITask";
import { TaskModel } from "../models/task.model";

class TaskRepository {
    public createTask(data: ITaskDto & { statusAtCreation: string }): Promise<ITask> {
        return TaskModel.create(data);
    }

    public getAllTasksByOrderId(orderId: string): Promise<ITask[]> {
        return TaskModel.find({ order: orderId })
            .sort({ dueDate: 1 })
            .populate("assignee", "name surname");
    }

    public getAllTasksByAssigneeId(assigneeId: string): Promise<ITask[]> {
        return TaskModel.find({ assignee: assigneeId, isDone: false })
            .sort({ dueDate: 1 })
            .populate("order", "name surname email");
    }

    public markDone(taskId: string): Promise<ITask | null> {
        return TaskModel.findByIdAndUpdate(
            taskId,
            { isDone: true },
            { new: true },
        );
    }

    public getDueUnremindedTasks(now: Date): Promise<ITask[]> {
        return TaskModel.find({
            isDone: false,
            reminderSentAt: null,
            dueDate: { $lte: now },
        })
            .populate("assignee", "surname telegram_chat_id telegram_notifications")
            .populate("order", "name surname status");
    }

    public markReminderSent(taskId: string): Promise<void> {
        return TaskModel.updateOne(
            { _id: taskId },
            { reminderSentAt: new Date() },
        ).then(() => undefined);
    }
}

export const taskRepository = new TaskRepository();
