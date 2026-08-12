import mongoose from "mongoose";
import INotification from "../interfaces/INotification";
import NotificationEvent from "../enums/notification-event.enum";

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        event: {
            type: String,
            enum: NotificationEvent,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "order",
            default: null,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export const NotificationModel = mongoose.model<INotification>(
    "notification",
    notificationSchema,
);
