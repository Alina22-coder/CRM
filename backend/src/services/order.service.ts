import { orderRepository } from "../repositories/order.repository";

class OrderService {
  public getAllOrders() {
    return orderRepository.getAllOrders();
  }
}
export const orderService = new OrderService();
