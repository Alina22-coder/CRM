import { useNavigate } from "react-router-dom";
import RegexEnum from "../../enums/regex.enum";
import { authService } from "../../services/auth.service";
import styles from "./LoginForm.module.scss";
import { useForm } from "react-hook-form";
import { useState } from "react";
import type { ILoginForm } from "../../interfaces/ILoginForm";

export const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginForm>();

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const onSubmit = async (values: ILoginForm) => {
        console.log(values);

        try {
            const { data } = await authService.login({
                email: values.email,
                password: values.password,
            });

            localStorage.setItem("accessToken", data.tokens.accessToken);
            localStorage.setItem("refreshToken", data.tokens.refreshToken);

            navigate("/orders");
        } catch (error) {
            setError("Invalid email or password");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div>
                <label>
                    Email
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: RegexEnum.EMAIL,
                                message: "Invalid email address",
                            },
                        })}
                    />
                </label>
                {errors.email && <p>{errors.email.message}</p>}
            </div>
            <div>
                <label>
                    Password
                    <input
                        type="password"
                        placeholder="Password"
                        {...register("password", {
                            required: "Password is required",
                            pattern: {
                                value: RegexEnum.PASSWORD,
                                message: "Invalid password",
                            },
                        })}
                    />
                </label>
                {errors.password && <p>{errors.password.message}</p>}
            </div>

            {error && <p>{error}</p>}

            <button type="submit">Login</button>
        </form>
    );
};
