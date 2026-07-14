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
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const onSubmit = async (values: ILoginForm) => {
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await authService.login({
                email: values.email,
                password: values.password,
            });

            localStorage.setItem("accessToken", data.tokens.accessToken);
            localStorage.setItem("refreshToken", data.tokens.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/orders");
        } catch {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.login}>
            <div className={styles.login__logo}>
                CRM<span>Pro</span>
            </div>

            <div className={styles.login__title}>Welcome back</div>
            <p className={styles.login__text}>Sign in to your account</p>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className={styles.login__form}
            >
                <div className={styles.form__group}>
                    <label>Email</label>
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
                    {errors.email && (
                        <p className={styles.error}>{errors.email.message}</p>
                    )}
                </div>
                <div className={styles.form__group}>
                    <label>Password</label>
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
                    {errors.password && (
                        <p className={styles.error}>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button
                    className={styles.login__btn}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Login"}
                </button>
            </form>
        </div>
    );
};
