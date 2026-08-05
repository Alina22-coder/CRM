export type HistoryType =
    | "status_change"
    | "manager_change"
    | "group_change"
    | "field_edit"
    | "comment_added";

export interface IHistory {
    _id: string;
    order:
        | string
        | { _id: string; name: string; surname: string; email: string };
    author: { _id: string; name: string; surname: string } | string;
    type: HistoryType;
    field?: string;
    old_value?: string | null;
    new_value?: string | null;
    created_at: Date;
}

export interface IHistoryQuery {
    page?: number;
    pageSize?: number;
    author?: string;
    start_date?: string;
    end_date?: string;
}
