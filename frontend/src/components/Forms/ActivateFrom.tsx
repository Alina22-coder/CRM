import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import styles from "./ActivateFrom.module.scss";
import { useForm } from "react-hook-form";
import { authService } from "../../services/auth.service";

type ActivateFormType = {
    password: string;
    confirmPassword: string;
};

export const ActivateForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ActivateFormType>();
    const { token } = useParams();
    const navigate = useNavigate();

    const onSubmit = (data: ActivateFormType) => {
        authService.setPassword(token!, data.password).then(() => {
            navigate("/auth/login");
        });
    };

    return (
        <div className={styles.activate}>
            <div className={styles.activate__logo}>
                CRM<span>Pro</span>
            </div>

            <div className={styles.activate__title}>Set your password</div>
            <p className={styles.activate__text}>
                You're activating your CRM account. Choose a strong password to
                get started.
            </p>

            <form
                className={styles.activate__form}
                onSubmit={handleSubmit(onSubmit)}
            >
                <div>
                    <label>New password</label>
                    <input
                        type="password"
                        placeholder="Enter your new password"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message:
                                    "Password must be at least 8 characters long",
                            },
                        })}
                    />
                    {errors.password && (
                        <p className={styles.error}>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div>
                    <label>Confirm password</label>
                    <input
                        type="password"
                        placeholder="Confirm your new password"
                        {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                                value === getValues("password") ||
                                "Passwords do not match",
                        })}
                    />
                    {errors.confirmPassword && (
                        <p className={styles.error}>
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <button className={styles.activate__btn} type="submit">
                    Activate account
                </button>
            </form>
        </div>
    );
};
