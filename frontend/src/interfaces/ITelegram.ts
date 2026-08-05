export type NotificationEvent = "new_order" | "status_change" | "comment_added";

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
    new_order: "New order",
    status_change: "Status change",
    comment_added: "New comment",
};

export interface ITelegramLinkCodeResponse {
    code: string;
}
