import RoleEnum from "../enums/role.enum";
import type { IBase } from "./IBase";
import type { NotificationEvent } from "./ITelegram";

export interface IUser extends IBase {
    _id: string;
    email: string;
    password: string;
    name: string;
    surname: string;
    role: RoleEnum;
    is_active: boolean;
    is_banned: boolean;
    isDeleted: boolean;
    isVerified: boolean;
    last_login: Date | null;
    telegram_chat_id?: string | null;
    telegram_notifications?: Partial<Record<NotificationEvent, boolean>>;
}

export interface IUserQuery {
    pageSize: number;
    page: number;
    search?: string;
    order?: string;
}

export type IUserLoginDTO = Pick<IUser, "email" | "password">;
export type IUserRegisterDTO = Pick<IUser, "email" | "name" | "surname">;
