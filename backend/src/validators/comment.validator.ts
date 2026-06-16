import joi from "joi";

export class CommentValidator {
    public static create = joi.object({
        text: joi.string().trim().min(1).required(),
    });
}
