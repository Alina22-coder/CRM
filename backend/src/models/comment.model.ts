import mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        _orderId: {
            type: Schema.Types.ObjectId,
            ref: "order",
            required: true,
        },
        _userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    },
    { timestamps: true },
);

export const CommentModel = mongoose.model("comment", commentSchema);
