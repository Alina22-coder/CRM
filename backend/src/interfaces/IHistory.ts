import { Types } from "mongoose";
import HistoryType from "../enums/history-type.enum";

interface IHistory {
    _id: Types.ObjectId;
    order: Types.ObjectId;
    author: Types.ObjectId;
    type: HistoryType;
    field?: string;
    old_value?: string | null;
    new_value?: string | null;
    created_at: Date;
}

export type IHistoryDto = Pick<
    IHistory,
    "type" | "field" | "old_value" | "new_value"
> & { order: string; author: string };

export default IHistory;
