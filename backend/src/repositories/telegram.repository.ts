import ITelegramLinkToken from "../interfaces/ITelegramLinkToken";
import { TelegramLinkTokenModel } from "../models/telegram-link-token.model";

class TelegramRepository {
    public createLinkToken(
        userId: string,
        code: string,
        expiresAt: Date,
    ): Promise<ITelegramLinkToken> {
        return TelegramLinkTokenModel.create({
            code,
            user: userId,
            expires_at: expiresAt,
        });
    }

    public findValidToken(code: string): Promise<ITelegramLinkToken | null> {
        return TelegramLinkTokenModel.findOne({
            code,
            expires_at: { $gt: new Date() },
        });
    }

    public deleteToken(id: string): Promise<ITelegramLinkToken | null> {
        return TelegramLinkTokenModel.findByIdAndDelete(id);
    }

    public deleteTokensByUserId(userId: string): Promise<unknown> {
        return TelegramLinkTokenModel.deleteMany({ user: userId });
    }
}

export const telegramRepository = new TelegramRepository();
