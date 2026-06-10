import joi from "joi";
import RegexEnum from "../enums/regex.enum";

export class UserValidator {
    private static email = joi.string().email().required();
    private static password = joi.string().regex(RegexEnum.PASSWORD);
    private static firstName = joi.string().regex(RegexEnum.NAME);
    private static surname = joi.string().regex(RegexEnum.NAME);

    public static register = joi.object({
        email: this.email.required(),
        password: this.password.required(),
        name: this.firstName.required(),
        surname: this.surname.required(),
    });

    public static create = joi.object({
        email: this.email.required(),
        name: this.firstName.required(),
        surname: this.surname.required(),
    });

    public static update = joi.object({
        name: this.firstName.required(),
        surname: this.surname.required(),
    });
}
