import joi from "joi";

export class GroupValidator {
    public static create = joi.object({
        name: joi.string().trim().min(1).max(50).required(),
    });
}
