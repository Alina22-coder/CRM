import joi from "joi";
import AutoAssignMode from "../enums/auto-assign-mode.enum";

export class AutoAssignValidator {
    public static update = joi.object({
        enabled: joi.boolean(),
        mode: joi.string().valid(...Object.values(AutoAssignMode)),
        participantIds: joi.array().items(joi.string()),
    });
}
