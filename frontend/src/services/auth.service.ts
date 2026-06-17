import api from "../api/axios";
import type { IUserLoginDTO } from "../interfaces/IUser";

export const authService = {
    login: (data: IUserLoginDTO) => {
        return api.post("/auth/login", data);
    },
};
