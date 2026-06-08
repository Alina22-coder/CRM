import { IToken } from "../interfaces/IToken";
import { Token } from "../models/token.model";

class TokenRepository {
    public create(dto: any): Promise<IToken> {
        return Token.create(dto);
    }

    public findByParams(params: Partial<IToken>): Promise<IToken | null> {
        return Token.findOne(params);
    }
}

export const tokenRepository = new TokenRepository();
