import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { OrderModel } from "../models/order.model";

class OrderRepository {
    public async getAllOrders(query: IOrderQuery): Promise<IOrder[]> {
        const { page, pageSize, search, order } = query;
        const filter = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: "i" } },
                      { email: { $regex: search, $options: "i" } },
                      { surname: { $regex: search, $options: "i" } },
                  ],
              }
            : {};
        const sortField = order?.startsWith("-") ? order.slice(1) : order;
        const sortDir = order?.startsWith("-") ? -1 : 1;
        const q = OrderModel.find(filter);
        q.sort(sortField ? { [sortField]: sortDir } : { _id: -1 });
        return q.skip((page - 1) * pageSize).limit(pageSize);
    }

    public getOrderById(orderId: string) {
        return OrderModel.findById(orderId);
    }
}
export const orderRepository = new OrderRepository();
