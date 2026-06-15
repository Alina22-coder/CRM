import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true },
);

export const GroupModel = mongoose.model("group", groupSchema);
