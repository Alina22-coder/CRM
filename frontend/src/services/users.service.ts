import api from "../api/axios";
import type { IUser, IUserQuery, IUserRegisterDTO } from "../interfaces/IUser";

const userService = {
    getAllUsers: (query: IUserQuery, signal?: AbortSignal) => {
        return api.get("/users", { params: query, signal });
    },

    getUserById: (userId: string) => {
        return api.get(`/users/${userId}`);
    },

    createUser: (body: IUserRegisterDTO) => {
        return api.post("/users", body);
    },

    updateUserById: (userId: string, update: Partial<IUser>) => {
        return api.put(`/users/${userId}`, update);
    },

    uploadAvatar: (userId: string, file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return api.post(`/users/${userId}/avatar`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    deleteUserById: (userId: string) => {
        return api.delete(`/users/${userId}`);
    },

    banUser: (userId: string) => {
        return api.patch(`/users/${userId}/ban`);
    },

    unbanUser: (userId: string) => {
        return api.patch(`/users/${userId}/unban`);
    },

    getStatisticByManager: (userId: string) => {
        return api.get(`/users/${userId}/statistic`);
    },
};

export default userService;
