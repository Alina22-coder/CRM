export interface ITask {
    _id: string;
    title: string;
    order: string;
    assignee: string | { _id: string; name: string; surname: string };
    dueDate: string;
    statusAtCreation: string;
    isDone: boolean;
    reminderSentAt: string | null;
    createdAt: string;
}
