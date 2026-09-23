import joi from "joi";
import Status from "../enums/status.enum";

export class CommentValidator {
    public static create = joi.object({
        text: joi.string().trim().min(1).required(),
        status: joi
            .string()
            .valid(...Object.values(Status)),
        disagree_reason: joi
            .string()
            .trim()
            .max(200)
            .when("status", {
                is: Status.DISAGREE,
                then: joi.required(),
                otherwise: joi.allow(null, ""),
            }),
        disagree_reason_comment: joi.string().max(1000).allow(null, ""),
    });
}
