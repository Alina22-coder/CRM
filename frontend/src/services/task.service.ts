import api from "../api/axios";

export const taskService = {
    createTask: (
        orderId: string,
        data: { title: string; assignee: string; dueDate: string },
    ) => {
        return api.post(`/orders/${orderId}/tasks`, data);
    },

    getAllTasksByOrderId: (orderId: string) => {
        return api.get(`/orders/${orderId}/tasks`);
    },

    getMyTasks: () => {
        return api.get("/tasks/my");
    },

    markDone: (taskId: string) => {
        return api.patch(`/tasks/${taskId}/done`);
    },
};
