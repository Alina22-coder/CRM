import api from "../api/axios";
import type { IHistoryQuery } from "../interfaces/IHistory";

export const historyService = {
    getAllHistory: (query: IHistoryQuery) => {
        return api.get("/history", { params: query });
    },
};
