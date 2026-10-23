import joi from "joi";

export class HistoryValidator {
    public static query = joi.object({
        pageSize: joi.number().min(1).max(100).default(25),
        page: joi.number().min(1).default(1),
        author: joi.string().trim().allow(""),
        start_date: joi.string().isoDate(),
        end_date: joi.string().isoDate(),
    });
}
