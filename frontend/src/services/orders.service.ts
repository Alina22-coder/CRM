import api from "../api/axios";
import type { IOrder, IOrderQuery } from "../interfaces/IOrder";

export const orderService = {
    getAllOrders: (query: IOrderQuery) => {
        return api.get("/orders", { params: query });
    },

    getOrderById: (orderId: string) => {
        return api.get(`/orders/${orderId}`);
    },

    updateOrderById: (orderId: string, data: Partial<IOrder>) => {
        return api.patch(`/orders/${orderId}`, data);
    },

    updateOrderTags: (orderId: string, tags: string[]) => {
        return api.patch(`/orders/${orderId}/tags`, { tags });
    },

    reassignOrder: (orderId: string, managerId: string) => {
        return api.patch(`/orders/${orderId}/reassign`, { manager: managerId });
    },

    getOrderStatistic: () => {
        return api.get("/orders/statistic");
    },

    getLossReport: (query: { start_date?: string; end_date?: string }) => {
        return api.get("/orders/loss-report", { params: query });
    },

    getAllOrdersForExcel: (query: IOrderQuery) => {
        return api.get("/orders/excel", {
            params: query,
            responseType: "blob",
        });
    },

    createCommentToOrderById: (
        orderId: string,
        body: string,
        statusUpdate?: {
            status?: string;
            disagree_reason?: string;
            disagree_reason_comment?: string;
        },
    ) => {
        return api.post(`/orders/${orderId}/comments`, {
            text: body,
            ...statusUpdate,
        });
    },

    getHistoryByOrderId: (orderId: string) => api.get(`/orders/${orderId}/history`),
};
