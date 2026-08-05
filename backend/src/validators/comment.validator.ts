import joi from "joi";
import Status from "../enums/status.enum";
import DisagreeReason from "../enums/disagree-reason.enum";

export class CommentValidator {
    public static create = joi.object({
        text: joi.string().trim().min(1).required(),
        status: joi
            .string()
            .valid(...Object.values(Status)),
        disagree_reason: joi
            .string()
            .valid(...Object.values(DisagreeReason))
            .when("status", {
                is: Status.DISAGGRE,
                then: joi.required(),
                otherwise: joi.allow(null, ""),
            }),
        disagree_reason_comment: joi.string().allow(null, ""),
    });
}
