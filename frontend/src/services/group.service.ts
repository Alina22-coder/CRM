import api from "../api/axios";

export const groupService = {
    getAllGroups: () => {
        return api.get("/groups");
    },

    createGroup: (name: string) => {
        return api.post("/groups", { name });
    },
};
