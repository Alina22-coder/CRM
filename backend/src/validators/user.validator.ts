import joi from "joi";
import RegexEnum from "../enums/regex.enum";
import UserQueryOrderEnum from "../enums/user-query-order.enum";

export class UserValidator {
    private static email = joi.string().email().required();
    private static password = joi
        .string()
        .regex(RegexEnum.PASSWORD)
        .messages({
            "string.pattern.base":
                "Password must be between 8 and 128 characters long",
        });
    private static firstName = joi
        .string()
        .trim()
        .regex(RegexEnum.NAME)
        .messages({
            "string.pattern.base":
                "Name must start with a capital letter and contain only letters (2–50)",
        });
    private static surname = joi
        .string()
        .trim()
        .regex(RegexEnum.NAME)
        .messages({
            "string.pattern.base":
                "Surname must start with a capital letter and contain only letters (2–50)",
        });

    public static create = joi.object({
        email: this.email.required(),
        name: this.firstName.required(),
        surname: this.surname.required(),
    });

    public static update = joi.object({
        name: this.firstName,
        surname: this.surname,
        email: joi.string().email(),
    });

    public static setPassword = joi.object({
        token: joi.string().required(),
        password: this.password.required(),
    });

    public static changePassword = joi.object({
        currentPassword: joi.string().required(),
        newPassword: this.password.required(),
    });

    public static query = joi.object({
        pageSize: joi.number().min(1).max(100).default(25),
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
