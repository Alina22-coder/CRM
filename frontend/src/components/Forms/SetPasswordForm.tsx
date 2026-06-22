import styles from "./SetPasswordForm.module.scss";

export const SetPasswordForm = () => {
    return (
        <div className={styles.activate__page}>
            <div className={styles.set__password}>
                <div className={styles.set__password__icon}>🔐</div>

                <div className={styles.set__password__title}>
                    Set your password
                </div>
                <div className={styles.set__password__text}>
                    You're activating your CRM Pro account. Choose a strong
                    password to continue.
                </div>

                <div>
                    <div className={styles.set__password__field}>
                        <label>New password</label>
                        <input type="password" placeholder="New password" />
                    </div>
                    <div className={styles.set__password__field}>
                        <label>Confirm password</label>
                        <input type="password" placeholder="Confirm" />
                    </div>
                </div>

                <button className={styles.set__password__btn}>Activate account</button>
            </div>
        </div>
    );
};
