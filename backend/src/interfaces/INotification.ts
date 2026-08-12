import { Types } from "mongoose";
import NotificationEvent from "../enums/notification-event.enum";

interface INotification {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    event: NotificationEvent;
    text: string;
    order: Types.ObjectId | null;
    read: boolean;
    createdAt: Date;
}

export default INotification;
