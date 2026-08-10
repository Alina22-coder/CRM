import mongoose from "mongoose";
import ITask from "../interfaces/ITask";

const Schema = mongoose.Schema;

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "order",
            required: true,
        },
        assignee: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        statusAtCreation: {
            type: String,
            required: true,
        },
        isDone: {
            type: Boolean,
            default: false,
        },
        reminderSentAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

export const TaskModel = mongoose.model<ITask>("task", taskSchema);
