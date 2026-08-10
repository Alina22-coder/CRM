import api from "../api/axios";

export const overdueSettingsService = {
    getSettings: () => {
        return api.get("/overdue-settings");
    },

    updateSettings: (update: { enabled?: boolean; thresholdHours?: number }) => {
        return api.patch("/overdue-settings", update);
    },
};
