import { Types } from "mongoose";

interface IComment {
    _id: Types.ObjectId;
    text: string;
    _orderId: Types.ObjectId;
    _userId: Types.ObjectId;
    createdAt: Date;
}

export type ICommentDto = Pick<IComment, "text">;

export default IComment;
