import api from "../api/axios";
import type { NotificationEvent } from "../interfaces/ITelegram";

export const telegramService = {
    getStatus: () => {
        return api.get("/telegram/status");
    },

    getLinkCode: () => {
        return api.post("/telegram/link-code");
    },

    unlink: () => {
        return api.delete("/telegram/link");
    },

    updatePreferences: (
        preferences: Partial<Record<NotificationEvent, boolean>>,
    ) => {
        return api.patch("/telegram/preferences", preferences);
    },
};
