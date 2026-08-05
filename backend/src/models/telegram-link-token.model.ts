import mongoose from "mongoose";
import ITelegramLinkToken from "../interfaces/ITelegramLinkToken";

const Schema = mongoose.Schema;

const telegramLinkTokenSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    expires_at: {
        type: Date,
        required: true,
        expires: 0,
    },
});

export const TelegramLinkTokenModel = mongoose.model<ITelegramLinkToken>(
    "telegram_link_token",
    telegramLinkTokenSchema,
);
