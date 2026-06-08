import { OrderModel } from "../models/order.model";

class OrderRepository {
    public getAllOrders() {
        return OrderModel.find();
    }

    public getOrderById(orderId: string) {
        return OrderModel.findById(orderId);
    }
}
export const orderRepository = new OrderRepository();
