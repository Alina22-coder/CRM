import { IToken } from "../interfaces/IToken";
import { Token } from "../models/token.model";

class TokenRepository {
    public create(
        dto: Pick<IToken, "accessToken" | "refreshToken" | "_userId">,
    ): Promise<IToken> {
        return Token.create(dto);
    }

    public findByParams(params: Partial<IToken>): Promise<IToken | null> {
        return Token.findOne(params);
    }

    public deleteByParams(params: Partial<IToken>): Promise<any> {
        return Token.deleteOne(params);
    }

    public deleteAllByUserId(userId: string): Promise<any> {
        return Token.deleteMany({ _userId: userId });
    }
}

export const tokenRepository = new TokenRepository();
