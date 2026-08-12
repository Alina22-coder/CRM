import type { NotificationEvent } from "./ITelegram";

export interface INotification {
    _id: string;
    user: string;
    event: NotificationEvent;
    text: string;
    order: string | null;
    read: boolean;
    createdAt: string;
}
