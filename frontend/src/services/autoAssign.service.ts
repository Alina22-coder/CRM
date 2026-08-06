import api from "../api/axios";
import type { AutoAssignMode } from "../interfaces/IAutoAssignSettings";

export const autoAssignService = {
    getSettings: () => {
        return api.get("/auto-assign");
    },

    updateSettings: (update: {
        enabled?: boolean;
        mode?: AutoAssignMode;
        participantIds?: string[];
    }) => {
        return api.patch("/auto-assign", update);
    },
};
