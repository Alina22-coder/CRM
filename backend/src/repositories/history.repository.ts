import IHistory, { IHistoryDto } from "../interfaces/IHistory";
import { HistoryModel } from "../models/history.model";
import { buildDateRange } from "../helpers/buildDateRange";

class HistoryRepository {
    public createHistory(data: IHistoryDto): Promise<IHistory> {
        return HistoryModel.create(data);
    }

    public getAllHistoryByOrderId(orderId: string): Promise<IHistory[]> {
        return HistoryModel.find({ order: orderId })
            .sort({ created_at: -1 })
            .populate("author", "surname");
    }

    public async getAllHistory(filter: {
        author?: string;
        start_date?: string;
        end_date?: string;
        page: number;
        pageSize: number;
    }) {
        const query: Record<string, any> = {};

        if (filter.author) {
            query.author = filter.author;
        }

        if (filter.start_date || filter.end_date) {
            query.created_at = buildDateRange(filter.start_date, filter.end_date);
        }

        const [data, total] = await Promise.all([
            HistoryModel.find(query)
                .sort({ created_at: -1 })
                .skip((filter.page - 1) * filter.pageSize)
                .limit(filter.pageSize)
                .populate("author", "surname")
                .populate("order", "name surname email"),
            HistoryModel.countDocuments(query),
        ]);

        return { data, total };
    }
}

export const historyRepository = new HistoryRepository();
