import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import StatusCodes from "../enums/status-codes.enum";
import { ITokenPayload } from "../interfaces/IToken";

class TaskController {
    public async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            const orderId = req.params.id as string;
            const { title, assignee, dueDate } = req.body;

            const data = await taskService.createTask(
                orderId,
                assignee,
                title,
                dueDate,
            );

            res.status(StatusCodes.CREATED).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getAllTasksByOrderId(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const orderId = req.params.id as string;
            const data = await taskService.getAllTasksByOrderId(orderId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async getMyTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.tokenPayload as ITokenPayload;
            const data = await taskService.getMyTasks(userId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }

    public async markDone(req: Request, res: Response, next: NextFunction) {
        try {
            const taskId = req.params.taskId as string;
            const data = await taskService.markDone(taskId);
            res.status(StatusCodes.OK).json(data);
        } catch (e) {
            next(e);
        }
    }
}

export const taskController = new TaskController();
