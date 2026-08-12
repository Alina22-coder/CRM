import api from "../api/axios";
import type { INotification } from "../interfaces/INotification";

export const notificationService = {
    getNotifications: (query: { page?: number; pageSize?: number }) => {
        return api.get<{ data: INotification[]; total: number }>(
            "/notifications",
            { params: query },
        );
    },

    getUnreadCount: () => {
        return api.get<{ count: number }>("/notifications/unread-count");
    },

    markRead: (notificationId: string) => {
        return api.patch(`/notifications/${notificationId}/read`);
    },

    markAllRead: () => {
        return api.patch("/notifications/read-all");
    },
};
