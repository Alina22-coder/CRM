import type { IHistory } from "../interfaces/IHistory";

const FIELD_LABELS: Record<string, string> = {
    status: "Статус",
    manager: "Менеджер",
    group: "Група",
    name: "Ім'я",
    surname: "Прізвище",
    email: "Email",
    phone: "Телефон",
    age: "Вік",
    course: "Курс",
    course_format: "Формат курсу",
    course_type: "Тип курсу",
    sum: "Сума",
    already_paid: "Оплачено",
    utm: "UTM",
    msg: "Повідомлення",
};

const TYPE_LABELS: Record<IHistory["type"], string> = {
    status_change: "Статус",
    manager_change: "Менеджер",
    group_change: "Група",
    field_edit: "Поле",
    comment_added: "Коментар",
};

const getFieldLabel = (entry: IHistory): string => {
    if (entry.field && FIELD_LABELS[entry.field]) {
        return FIELD_LABELS[entry.field];
    }
    return TYPE_LABELS[entry.type];
};

export const formatHistoryText = (entry: IHistory): string => {
    if (entry.type === "comment_added") {
        return "Додано коментар";
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
