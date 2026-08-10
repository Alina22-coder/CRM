import { Types } from "mongoose";

interface ITask {
    _id: Types.ObjectId;
    title: string;
    order: Types.ObjectId;
    assignee: Types.ObjectId;
    dueDate: Date;
    statusAtCreation: string;
    isDone: boolean;
    reminderSentAt: Date | null;
    createdAt: Date;
}

export type ITaskDto = Pick<ITask, "title" | "dueDate"> & {
    order: string;
    assignee: string;
};

export default ITask;
