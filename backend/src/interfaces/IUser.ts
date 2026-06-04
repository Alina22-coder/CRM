import Role from "../enums/role.enum";

interface IUser {
  email: string;
  password: string;
  name: string;
  surname: string;
  role: Role;
  is_active: boolean;
  is_banned: boolean;
}

export type IUserDTO = Pick<IUser, "email" | "password">;

export default IUser;
