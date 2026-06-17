export interface IComment {
    _id: string;
    text: string;
    _orderId: string;
    _userId: string;
    createdAt: Date;
}

export type ICommentDto = Pick<IComment, "text"> & {
    _orderId: string;
    _userId: string;
};
