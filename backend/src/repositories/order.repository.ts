import { OrderModel } from "../models/order.model";

class OrderRepository {
  public getAllOrders() {
    return OrderModel.find();
  }
}
export const orderRepository = new OrderRepository();
