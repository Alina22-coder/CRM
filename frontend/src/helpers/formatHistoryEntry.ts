import type { IHistory } from "../interfaces/IHistory";

const FIELD_LABELS: Record<string, string> = {
    status: "Status",
    manager: "Manager",
    group: "Group",
    name: "Name",
    surname: "Surname",
    email: "Email",
    phone: "Phone",
    age: "Age",
    course: "Course",
    course_format: "Course format",
    course_type: "Course type",
    sum: "Sum",
    already_paid: "Already paid",
    utm: "UTM",
    msg: "Message",
};

const TYPE_LABELS: Record<IHistory["type"], string> = {
    status_change: "Status",
    manager_change: "Manager",
    group_change: "Group",
    field_edit: "Field",
    comment_added: "Comment",
};

const getFieldLabel = (entry: IHistory): string => {
    if (entry.field && FIELD_LABELS[entry.field]) {
        return FIELD_LABELS[entry.field];
    }
    return TYPE_LABELS[entry.type];
};

export const formatHistoryText = (entry: IHistory): string => {
    if (entry.type === "comment_added") {
        return "Comment added";
    }

    const label = getFieldLabel(entry);
    const oldValue = entry.old_value ?? "—";
    const newValue = entry.new_value ?? "—";

    return `${label}: ${oldValue} → ${newValue}`;
};

export const getHistoryAuthor = (
    entry: IHistory,
): { name: string; surname: string } | null => {
    return typeof entry.author === "object" ? entry.author : null;
};

export const getHistoryOrder = (
    entry: IHistory,
): { _id: string; name: string; surname: string; email: string } | null => {
    return typeof entry.order === "object" ? entry.order : null;
};
