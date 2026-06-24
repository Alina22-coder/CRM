import RoleEnum from "../enums/role.enum";
import IBase from "./IBase";

interface IUser extends IBase {
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
}

export interface IUserQuery {
    pageSize: number;
    page: number;
    search?: string;
    order?: string;
    excludeId?: string;
}

export type IUserLoginDTO = Pick<IUser, "email" | "password">;
export type IUserRegisterDTO = Pick<IUser, "email" | "name" | "surname">;

export default IUser;
