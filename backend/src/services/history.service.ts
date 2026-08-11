import { historyRepository } from "../repositories/history.repository";
import IOrder from "../interfaces/IOrder";
import HistoryType from "../enums/history-type.enum";

const TRACKED_FIELD_TO_TYPE: Partial<Record<keyof IOrder, HistoryType>> = {
    status: HistoryType.STATUS_CHANGE,
    manager: HistoryType.MANAGER_CHANGE,
    group: HistoryType.GROUP_CHANGE,
};

const UNTRACKED_FIELDS: Set<keyof IOrder> = new Set([
    "status_updated_at",
    "is_overdue",
    "disagree_at",
]);

class HistoryService {
    public async logOrderChanges(
        orderId: string,
        authorId: string,
        before: Partial<IOrder>,
        after: Partial<IOrder>,
    ) {
        const entries = [];

        for (const field of Object.keys(after) as (keyof IOrder)[]) {
            if (UNTRACKED_FIELDS.has(field)) continue;

            const oldValue = before[field];
            const newValue = after[field];

            if (oldValue === newValue) continue;

            const type = TRACKED_FIELD_TO_TYPE[field] ?? HistoryType.FIELD_EDIT;

            entries.push({
                order: orderId,
                author: authorId,
                type,
                field: field as string,
                old_value: oldValue != null ? String(oldValue) : null,
                new_value: newValue != null ? String(newValue) : null,
            });
        }

        if (entries.length) {
            await Promise.all(
                entries.map((entry) => historyRepository.createHistory(entry)),
            );
        }
    }

    public async logCommentAdded(orderId: string, authorId: string) {
        return historyRepository.createHistory({
            order: orderId,
            author: authorId,
            type: HistoryType.COMMENT_ADDED,
        });
    }

    public getAllHistoryByOrderId(orderId: string) {
        return historyRepository.getAllHistoryByOrderId(orderId);
    }

    public getAllHistory(filter: {
        author?: string;
        start_date?: string;
        end_date?: string;
        page: number;
        pageSize: number;
    }) {
        return historyRepository.getAllHistory(filter);
    }
}

export const historyService = new HistoryService();
