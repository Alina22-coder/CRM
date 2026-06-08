import IBase from "./IBase";
import Role from "../enums/role.enum";

interface IToken extends IBase {
    _id: string;
    accessToken: string;
    refreshToken: string;
    _userId: string;
}

interface ITokenPayload {
    userId: string;
    role: Role;
}

type ITokenPair = Pick<IToken, "accessToken" | "refreshToken">;

export { IToken, ITokenPayload, ITokenPair };
