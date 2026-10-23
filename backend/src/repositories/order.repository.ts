import mongoose from "mongoose";
import IOrder, { IOrderQuery } from "../interfaces/IOrder";
import { OrderModel } from "../models/order.model";
import Status from "../enums/status.enum";
import { escapeRegex } from "../helpers/escapeRegex";

class OrderRepository {
    private buildFilter(query: IOrderQuery, managerId?: string): object {
        const filter: Record<string, any> = {};

        const textFields: Array<keyof IOrderQuery> = [
            "name", "surname", "email", "phone", "group",
        ];
        for (const field of textFields) {
            if (query[field]) {
                filter[field] = {
                    $regex: escapeRegex(String(query[field])),
                    $options: "i",
                };
            }
        }

        const exactFields: Array<keyof IOrderQuery> = [
            "course", "course_format", "course_type",
        ];
        for (const field of exactFields) {
            if (query[field]) {
                filter[field] = query[field];
            }
        }

        if (query.status) {
            filter.status =
                query.status === Status.NEW
                    ? { $in: [Status.NEW, null] }
                    : query.status;
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

        if (query.my && managerId) {
            filter.manager = managerId;
        }

        return filter;
    }

    public async getAllOrders(
        query: IOrderQuery,
        managerId?: string,
    ): Promise<{ data: IOrder[]; total: number }> {
        const { page, pageSize, order } = query;
        const filter = this.buildFilter(query, managerId);

        const sortField = order?.startsWith("-") ? order.slice(1) : order;
        const sortDir = order?.startsWith("-") ? -1 : 1;

        const [data, total] = await Promise.all([
            OrderModel.find(filter)
                .sort(sortField ? { [sortField]: sortDir } : { created_at: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .populate("manager", "name surname"),
            OrderModel.countDocuments(filter),
        ]);

        return { data, total };
    }

    public getOrderById(orderId: string) {
        return OrderModel.findById(orderId).populate("manager", "name surname");
    }

    public updateOrderById(
        orderId: string,
        update: Partial<IOrder>,
    ): Promise<IOrder | null> {
        return OrderModel.findByIdAndUpdate(orderId, update, { new: true });
    }

    // Orders without a status are counted as New, same as the New filter.
    private async countByStatus(
        match: Record<string, any> = {},
    ): Promise<Record<string, number>> {
        const byStatus = await OrderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $ifNull: ["$status", Status.NEW] },
                    count: { $sum: 1 },
                },
            },
        ]);

        const statusCounts: Record<string, number> = {};
        for (const row of byStatus) {
            statusCounts[row._id] = row.count;
        }

        return statusCounts;
    }

    public async getOrderStatistic() {
        const [total, statusCounts, overdueCount] = await Promise.all([
            OrderModel.countDocuments(),
            this.countByStatus(),
            OrderModel.countDocuments({ is_overdue: true }),
        ]);

        return { total, ...statusCounts, overdueCount };
    }

    public async getStatisticByManager(managerId: string) {
        const match = { manager: new mongoose.Types.ObjectId(managerId) };
        const [total, statusCounts] = await Promise.all([
            OrderModel.countDocuments(match),
            this.countByStatus(match),
        ]);

        return { total, ...statusCounts };
    }

    public async getLossReport(filter: {
        start_date?: string;
        end_date?: string;
    }): Promise<{ reason: string; count: number }[]> {
        const match: Record<string, any> = { status: Status.DISAGREE };

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
        managerIds: string[],
    ): Promise<Record<string, number>> {
        const result = await OrderModel.aggregate([
            {
                $match: {
                    manager: {
                        $in: managerIds.map(
                            (id) => new mongoose.Types.ObjectId(id),
                        ),
                    },
                    status: Status.IN_WORK,
                },
            },
            { $group: { _id: "$manager", count: { $sum: 1 } } },
        ]);

        const counts: Record<string, number> = {};
        for (const id of managerIds) {
            counts[id] = 0;
        }
        for (const row of result) {
            counts[String(row._id)] = row.count;
        }

        return counts;
    }

    public async unassignManager(managerId: string): Promise<void> {
        await OrderModel.updateMany(
            { manager: managerId, status: Status.IN_WORK },
            {
                $set: {
                    status: Status.NEW,
                    status_updated_at: new Date(),
                    is_overdue: false,
                },
            },
        );
        await OrderModel.updateMany(
            { manager: managerId },
            { $set: { manager: null } },
        );
    }

    public createOrder(order: Partial<IOrder>): Promise<IOrder> {
        return OrderModel.create(order);
    }

    public getNewOrdersOlderThan(cutoff: Date): Promise<IOrder[]> {
        return OrderModel.find({
            status: { $in: [Status.NEW, null] },
            is_overdue: false,
            $expr: {
                $lte: [
                    { $ifNull: ["$status_updated_at", "$created_at"] },
                    cutoff,
                ],
            },
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
        managerId?: string,
    ): Promise<IOrder[]> {
        const { order } = query;
        const filter = this.buildFilter(query, managerId);
        const sortField = order?.startsWith("-") ? order.slice(1) : order;
        const sortDir = order?.startsWith("-") ? -1 : 1;

        const data = await OrderModel.find(filter)
            .sort(sortField ? { [sortField]: sortDir } : { created_at: -1 })
            .populate("manager", "name surname");

        return data;
    }
}
export const orderRepository = new OrderRepository();
