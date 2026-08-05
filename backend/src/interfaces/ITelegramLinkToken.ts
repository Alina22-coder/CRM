import { Types } from "mongoose";

interface ITelegramLinkToken {
    _id: Types.ObjectId;
    code: string;
    user: Types.ObjectId;
    expires_at: Date;
}

export default ITelegramLinkToken;
