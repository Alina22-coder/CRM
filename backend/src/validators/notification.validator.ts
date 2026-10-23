import joi from "joi";

export class NotificationValidator {
    public static query = joi.object({
        pageSize: joi.number().min(1).max(100).default(20),
        page: joi.number().min(1).default(1),
    });
}
