import api from "../api/axios";
import type { IOrderQuery } from "../interfaces/IOrder";

export const orderService = {
    getAllOrders(query: IOrderQuery) {
        return api.get("/orders", { params: query });
    },
};
