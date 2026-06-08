import Role from "../enums/role.enum";
import IBase from "./IBase";

interface IUser extends IBase {
    email: string;
    password: string;
    name: string;
    surname: string;
    role: Role;
    is_active: boolean;
    is_banned: boolean;
    isDeleted: boolean;
    isVerified: boolean;
}

export type IUserDTO = Pick<IUser, "email" | "password">;

export default IUser;
