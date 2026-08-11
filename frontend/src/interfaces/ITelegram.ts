export type NotificationEvent =
    | "new_order"
    | "status_change"
    | "comment_added"
    | "order_overdue"
    | "task_reminder";

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
    new_order: "New order",
    status_change: "Status change",
    comment_added: "New comment",
    order_overdue: "Overdue order",
    task_reminder: "Task reminder",
};

export interface ITelegramLinkCodeResponse {
    code: string;
}
