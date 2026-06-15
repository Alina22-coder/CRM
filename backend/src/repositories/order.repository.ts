import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { OrderModel } from "../models/order.model";

class OrderRepository {
    public async getAllOrders(
        query: IOrderQuery,
    ): Promise<{ data: IOrder[]; total: number }> {
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

        const [data, total] = await Promise.all([
            OrderModel.find(filter)
                .sort(sortField ? { [sortField]: sortDir } : { _id: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize),
            OrderModel.countDocuments(filter),
        ]);

        return { data, total };
    }

    public getOrderById(orderId: string) {
        return OrderModel.findById(orderId);
    }

    public updateOrderById(
        orderId: string,
        update: Partial<IOrder>,
    ): Promise<IOrder | null> {
        return OrderModel.findByIdAndUpdate(orderId, update, { new: true });
    }
}
export const orderRepository = new OrderRepository();
