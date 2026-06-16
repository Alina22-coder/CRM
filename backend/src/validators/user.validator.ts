import joi from "joi";
import RegexEnum from "../enums/regex.enum";
import UserQueryOrderEnum from "../enums/user-query-order.enum";

export class UserValidator {
    private static email = joi.string().email().required();
    private static password = joi.string().regex(RegexEnum.PASSWORD);
    private static firstName = joi.string().regex(RegexEnum.NAME);
    private static surname = joi.string().regex(RegexEnum.NAME);

    public static create = joi.object({
        email: this.email.required(),
        name: this.firstName.required(),
        surname: this.surname.required(),
    });

    public static update = joi.object({
        name: this.firstName.required(),
        surname: this.surname.required(),
    });

    public static query = joi.object({
        pageSize: joi.number().min(1).default(25),
        page: joi.number().min(1).default(1),
        search: joi.string().trim(),
        order: joi
            .string()
            .valid(
                ...Object.values(UserQueryOrderEnum),
                ...Object.values(UserQueryOrderEnum).map((item) => `-${item}`),
            ),
    });
}
