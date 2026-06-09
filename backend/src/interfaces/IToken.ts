import IBase from "./IBase";
import RoleEnum from "../enums/role.enum";

interface IToken extends IBase {
    _id: string;
    accessToken: string;
    refreshToken: string;
    _userId: string;
}

interface ITokenPayload {
    userId: string;
    role: RoleEnum;
}

type ITokenPair = Pick<IToken, "accessToken" | "refreshToken">;
type IRefresh = Pick<IToken, "refreshToken">;

export { IToken, ITokenPayload, ITokenPair, IRefresh };
