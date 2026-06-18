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

    getOrderStatistic: () => {
        return api.get("/orders/statistic");
    },

    getAllOrdersForExcel: (query: IOrderQuery) => {
        return api.get("/orders/excel", {
            params: query,
            responseType: "blob",
        });
    },

    createCommentToOrderById: (orderId: string, body: string) => {
        return api.post(`/orders/${orderId}/comments`, { text: body });
    },
};
