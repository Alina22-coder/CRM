import type { IUser } from "../interfaces/IUser";

export const useCurrentUser = (): IUser | null => {
    const user = localStorage.getItem("user");

    if (user) {
        return JSON.parse(user);
    }

    return null;
};
