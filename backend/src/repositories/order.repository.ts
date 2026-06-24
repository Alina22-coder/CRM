import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { OrderModel } from "../models/order.model";

class OrderRepository {
    private buildFilter(query: IOrderQuery, managerSurname?: string): object {
        const filter: Record<string, any> = {};

        const textFields: Array<keyof IOrderQuery> = [
            "name", "surname", "email", "phone", "group",
        ];
        for (const field of textFields) {
            if (query[field]) {
                filter[field] = { $regex: query[field], $options: "i" };
            }
        }

        const exactFields: Array<keyof IOrderQuery> = [
            "course", "course_format", "course_type", "status",
        ];
        for (const field of exactFields) {
            if (query[field]) {
                filter[field] = query[field];
            }
        }

        if (query.age !== undefined) {
            filter.age = query.age;
        }

        if (query.start_date || query.end_date) {
            filter.created_at = {};
            if (query.start_date) {
                filter.created_at.$gte = new Date(query.start_date);
            }
            if (query.end_date) {
                filter.created_at.$lte = new Date(query.end_date);
            }
        }

        if (query.my && managerSurname) {
            filter.manager = managerSurname;
        }

        return filter;
    }

    public async getAllOrders(
        query: IOrderQuery,
        managerSurname?: string,
    ): Promise<{ data: IOrder[]; total: number }> {
        const { page, pageSize, order } = query;
        const filter = this.buildFilter(query, managerSurname);

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

    public async getOrderStatistic() {
        const [total, byStatus] = await Promise.all([
            OrderModel.countDocuments(),
            OrderModel.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);
        return { total, byStatus };
    }

    public async getStatisticByManager(managerEmail: string) {
        const [total, byStatus] = await Promise.all([
            OrderModel.countDocuments({ manager: managerEmail }),
            OrderModel.aggregate([
                { $match: { manager: managerEmail } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);
        return { total, byStatus };
    }

    public async getAllOrdersForExcel(
        query: IOrderQuery,
        managerSurname?: string,
    ): Promise<IOrder[]> {
        const { order } = query;
        const filter = this.buildFilter(query, managerSurname);
        const sortField = order?.startsWith("-") ? order.slice(1) : order;
        const sortDir = order?.startsWith("-") ? -1 : 1;

        const data = await OrderModel.find(filter).sort(
            sortField ? { [sortField]: sortDir } : { _id: -1 },
        );

        return data;
    }
}
export const orderRepository = new OrderRepository();
