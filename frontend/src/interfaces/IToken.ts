import type { IBase } from "./IBase";
import RoleEnum from "../enums/role.enum";

export interface IToken extends IBase {
    _id: string;
    accessToken: string;
    refreshToken: string;
    _userId: string;
}

export interface ITokenPayload {
    userId: string;
    role: RoleEnum;
    isActivation?: boolean;
}

export type ITokenPair = Pick<IToken, "accessToken" | "refreshToken">;
export type IRefresh = Pick<IToken, "refreshToken">;
