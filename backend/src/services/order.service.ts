import { orderRepository } from "../repositories/order.repository";

class OrderService {
    public getAllOrders() {
        return orderRepository.getAllOrders();
    }

    public getOrderById(orderId: string) {
        return orderRepository.getOrderById(orderId);
    }
}
export const orderService = new OrderService();
