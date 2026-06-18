import api from "../api/axios";
import type { IUser, IUserQuery, IUserRegisterDTO } from "../interfaces/IUser";

const UserService = {
    getAllUsers: (query: IUserQuery) => {
        return api.get("/users", { params: query });
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

export default UserService;
