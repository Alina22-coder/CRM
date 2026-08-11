import mongoose from "mongoose";
import IUser from "../interfaces/IUser";
import RoleEnum from "../enums/role.enum";

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            select: false,
        },
        name: {
            type: String,
        },
        surname: {
            type: String,
        },
        role: {
            type: String,
            enum: RoleEnum,
            default: RoleEnum.Manager,
        },
        is_active: {
            type: Boolean,
            default: false,
        },
        is_banned: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        last_login: {
            type: Date,
            default: null,
        },
        tokenVersion: {
            type: Number,
            default: 0,
        },
        telegram_chat_id: {
            type: String,
            default: null,
            unique: true,
            sparse: true,
        },
        telegram_notifications: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true },
);

userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email });
};

export const UserModel = mongoose.model<IUser>("user", userSchema);
