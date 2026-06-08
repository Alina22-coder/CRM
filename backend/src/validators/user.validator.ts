import joi from "joi";

export class UserValidator {
    private static email = joi.string().email().required();
    private static password = joi.string().min(6).required();

    public static register = joi.object({
        email: this.email.required(),
        password: this.password.required(),
    });
}
