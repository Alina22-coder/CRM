import api from "../api/axios";
import type { IUserLoginDTO } from "../interfaces/IUser";

export const authService = {
    login: (dto: IUserLoginDTO) => {
        return api.post("/auth/login", dto);
    },

    refresh: (refreshToken: string) => {
        return api.post("/auth/refresh", { refreshToken });
    },

    logout: () => {
        return api.delete("/auth/logout");
    },

    activate: (userId: string) => {
        return api.post(`/auth/activate/${userId}`);
    },

    setPassword: (token: string, password: string) => {
        return api.post("/auth/set-password", { token, password });
    },

    recovery: (userId: string) => {
        return api.post(`/auth/recovery/${userId}`);
    },
};
