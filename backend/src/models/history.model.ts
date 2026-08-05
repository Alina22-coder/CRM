import mongoose from "mongoose";
import IHistory from "../interfaces/IHistory";
import HistoryType from "../enums/history-type.enum";

const Schema = mongoose.Schema;

const historySchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "order",
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        type: {
            type: String,
            enum: HistoryType,
            required: true,
        },
        field: {
            type: String,
            default: null,
        },
        old_value: {
            type: String,
            default: null,
        },
        new_value: {
            type: String,
            default: null,
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export const HistoryModel = mongoose.model<IHistory>("history", historySchema);
