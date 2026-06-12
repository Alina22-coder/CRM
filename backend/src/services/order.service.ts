import { IOrderQuery } from "../interfaces/IOrder";
import { orderRepository } from "../repositories/order.repository";

class OrderService {
    public getAllOrders(query: IOrderQuery) {
        return orderRepository.getAllOrders(query);
    }

    public getOrderById(orderId: string) {
        return orderRepository.getOrderById(orderId);
    }

    public updateOrderById(orderId: string) {
        return orderRepository.updateOrderById(orderId);
    }
}
export const orderService = new OrderService();
