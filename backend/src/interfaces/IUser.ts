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
}

export type IUserLoginDTO = Pick<IUser, "email" | "password">;
export type IUserRegisterDTO = Pick<
    IUser,
    "email" | "password" | "name" | "surname"
>;

export default IUser;
