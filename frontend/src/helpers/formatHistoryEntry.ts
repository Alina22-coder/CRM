import type { IHistory } from "../interfaces/IHistory";

const FIELD_LABELS: Record<string, string> = {
    status: "status",
    manager: "manager",
    group: "group",
    name: "name",
    surname: "surname",
    email: "email",
    phone: "phone",
    age: "age",
    course: "course",
    course_format: "course format",
    course_type: "course type",
    sum: "sum",
    already_paid: "already paid",
    utm: "UTM",
    msg: "message",
    disagree_reason: "disagree reason",
    disagree_reason_comment: "disagree comment",
};

const HIDDEN_FIELDS = new Set(["status_updated_at", "is_overdue", "disagree_at"]);

export type HistoryTypeMeta = {
    icon: string;
    colorVar: "purple" | "green" | "primary" | "yellow" | "pink";
};

const TYPE_META: Record<IHistory["type"], HistoryTypeMeta> = {
    status_change: { icon: "🔄", colorVar: "yellow" },
    manager_change: { icon: "👤", colorVar: "primary" },
    group_change: { icon: "🏷️", colorVar: "pink" },
    field_edit: { icon: "✏️", colorVar: "purple" },
    comment_added: { icon: "💬", colorVar: "green" },
};

export const getHistoryTypeMeta = (entry: IHistory): HistoryTypeMeta => {
    return TYPE_META[entry.type];
};

const getFieldLabel = (entry: IHistory): string => {
    if (entry.field && FIELD_LABELS[entry.field]) {
        return FIELD_LABELS[entry.field];
    }
    return entry.type === "manager_change" ? "manager" : "group";
};

const describeAction = (entry: IHistory, withOrder: boolean): string => {
    const suffix = withOrder ? " order" : "";

    switch (entry.type) {
        case "comment_added":
            return withOrder ? "left a comment on order" : "left a comment";
        case "manager_change":
            return entry.old_value
                ? `reassigned${suffix}`
                : `was assigned to${suffix}`;
        case "status_change":
            return `updated the status${withOrder ? " of order" : ""}`;
        case "group_change":
            return `changed the group${withOrder ? " of order" : ""}`;
        case "field_edit":
            return `updated the ${getFieldLabel(entry)}${withOrder ? " of order" : ""}`;
        default:
            return `updated${suffix}`;
    }
};

export const formatHistoryAction = (
    entry: IHistory,
    withOrder: boolean = true,
): string => {
    return describeAction(entry, withOrder);
};

export const formatHistoryValueChange = (entry: IHistory): string | null => {
    if (entry.type === "comment_added") return null;

    const newValue = entry.new_value ?? "—";

    if (entry.type === "status_change" || entry.type === "manager_change" || entry.type === "group_change") {
        return newValue;
    }

    const oldValue = entry.old_value ?? "—";
    return `${oldValue} → ${newValue}`;
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
): { surname: string } | null => {
    return typeof entry.author === "object" ? entry.author : null;
};

export const isHiddenHistoryEntry = (entry: IHistory): boolean => {
    return !!entry.field && HIDDEN_FIELDS.has(entry.field);
};

export const getHistoryOrder = (
    entry: IHistory,
): { _id: string; name: string; surname: string; email: string } | null => {
    return typeof entry.order === "object" ? entry.order : null;
};
