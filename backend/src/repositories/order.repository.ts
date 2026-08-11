import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { OrderModel } from "../models/order.model";
import Status from "../enums/status.enum";

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
                .sort(sortField ? { [sortField]: sortDir } : { created_at: -1 })
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
        const [total, byStatus, overdueCount] = await Promise.all([
            OrderModel.countDocuments(),
            OrderModel.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            OrderModel.countDocuments({ is_overdue: true }),
        ]);

        const statusCounts: Record<string, number> = {};
        for (const row of byStatus) {
            statusCounts[row._id] = row.count;
        }

        return { total, ...statusCounts, overdueCount };
    }

    public async getStatisticByManager(managerSurname: string) {
        const [total, byStatus] = await Promise.all([
            OrderModel.countDocuments({ manager: managerSurname }),
            OrderModel.aggregate([
                { $match: { manager: managerSurname } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);
        return { total, byStatus };
    }

    public async getLossReport(filter: {
        start_date?: string;
        end_date?: string;
    }): Promise<{ reason: string; count: number }[]> {
        const match: Record<string, any> = { status: Status.DISAGGRE };

        if (filter.start_date || filter.end_date) {
            match.disagree_at = {};
            if (filter.start_date) {
                match.disagree_at.$gte = new Date(filter.start_date);
            }
            if (filter.end_date) {
                match.disagree_at.$lte = new Date(filter.end_date);
            }
        }

        const result = await OrderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $ifNull: ["$disagree_reason", "Unspecified"] },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        return result.map((row) => ({ reason: row._id, count: row.count }));
    }

    public async getActiveOrderCountsByManagers(
        managerSurnames: string[],
    ): Promise<Record<string, number>> {
        const result = await OrderModel.aggregate([
            {
                $match: {
                    manager: { $in: managerSurnames },
                    status: Status.IN_WORK,
                },
            },
            { $group: { _id: "$manager", count: { $sum: 1 } } },
        ]);

        const counts: Record<string, number> = {};
        for (const surname of managerSurnames) {
            counts[surname] = 0;
        }
        for (const row of result) {
            counts[row._id] = row.count;
        }

        return counts;
    }

    public createOrder(order: Partial<IOrder>): Promise<IOrder> {
        return OrderModel.create(order);
    }

    public getNewOrdersOlderThan(cutoff: Date): Promise<IOrder[]> {
        return OrderModel.find({
            status: Status.NEW,
            is_overdue: false,
            status_updated_at: { $lte: cutoff },
        });
    }

    public markOverdue(orderId: string): Promise<IOrder | null> {
        return OrderModel.findByIdAndUpdate(
            orderId,
            { is_overdue: true },
            { new: true },
        );
    }

    public getOverdueCount(): Promise<number> {
        return OrderModel.countDocuments({ is_overdue: true });
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
            sortField ? { [sortField]: sortDir } : { created_at: -1 },
        );

        return data;
    }
}
export const orderRepository = new OrderRepository();
