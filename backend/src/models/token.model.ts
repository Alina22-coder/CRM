
import { Schema, model } from "mongoose";
import { IToken } from "../interfaces/IToken";

const TokenSchema = new Schema(
    {
        accessToken: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        _userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true, versionKey: false },
);

export const Token = model<IToken>("tokens", TokenSchema);
