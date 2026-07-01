import { useForm } from "react-hook-form";
import styles from "./CreateManagerModal.module.scss";
import userService from "../../services/users.service";

type CreateManagerModalType = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

type CreateManagerForm = {
    email: string;
    name: string;
    surname: string;
};

export const CreateManagerModal = ({
    isOpen,
    onClose,
    onSuccess,
}: CreateManagerModalType) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateManagerForm>();

    const onSubmit = (data: CreateManagerForm) => {
        userService.createUser(data).then(() => {
            onSuccess();
            onClose();
        });
    };

    if (!isOpen) return null;
    return (
        <div className={styles.modal__overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <div className={styles.header__title}>New manager</div>
                    {/* TODO add btn */}
                    <button className={styles.header__btn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.modal__main}>
                    <div className={styles.modal__field}>
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="First name"
                            {...register("name", {
                                required: "Name is required",
                                minLength: {
                                    value: 2,
                                    message: "Min 2 characters",
                                },
                            })}
                        />
                        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
                    </div>
                    <div className={styles.modal__field}>
                        <label>Surname</label>
                        <input
                            type="text"
                            placeholder="Last name"
                            {...register("surname", {
                                required: "Surname is required",
                                minLength: {
                                    value: 2,
                                    message: "Min 2 characters",
                                },
                            })}
                        />
                        {errors.surname && (
                            <span className={styles.error}>{errors.surname.message}</span>
                        )}
                    </div>
                    <div className={styles.modal__field}>
                        <label>Email</label>
                        <input
                            type="text"
                            placeholder="manager@gmail.com"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format",
                                },
                            })}
                        />
                        {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                    </div>
                </div>

                <div className={styles.modal__footer}>
                    <button className={styles.footer__cancel} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.footer__create}
                        onClick={handleSubmit(onSubmit)}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};
