import joi from "joi";

export class TaskValidator {
    public static create = joi.object({
        title: joi.string().trim().min(1).required(),
        assignee: joi.string().required(),
        dueDate: joi.string().isoDate().required(),
    });
}
