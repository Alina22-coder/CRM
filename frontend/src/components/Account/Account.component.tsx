import { useCurrentUser } from "../../hooks/useCurrectUser";
import styles from "./Account.module.scss";

export const Account = () => {
    const user = useCurrentUser();

    return (
        <div className={styles.account}>
            <div className={styles.account__block}>
                <div className={styles.account__title}>Account info</div>

                <div className={styles.account__profile}>
                    <div className={styles.profile__avatar}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className={styles.profile}>
                        <div className={styles.profile__user}>
                            {user?.name} {user?.surname}
                        </div>
                        <div className={styles.profile__role}>
                            Role: {user?.role}
                        </div>
                        <button className={styles.profile__upload}>
                            📷 Upload photo
                        </button>
                    </div>
                </div>

                <div>
                    <div className={styles.account__field}>
                        <label>Name</label>
                        <input type="text" defaultValue={user?.name ?? ""} />
                    </div>
                    <div className={styles.account__field}>
                        <label>Surname</label>
                        <input type="text" defaultValue={user?.surname ?? ""} />
                    </div>
                    <div className={styles.account__field}>
                        <label>Email</label>
                        <input type="text" defaultValue={user?.email ?? ""} />
                    </div>
                </div>

                <button className={styles.account__btn}>Save changes</button>
            </div>

            <div className={styles.account__block}>
                <div className={styles.account__title}>Change password</div>

                <div>
                    <div className={styles.account__field}>
                        <label>Current password</label>
                        <input type="password" placeholder="Current password" />
                    </div>
                    <div className={styles.account__field}>
                        <label>New password</label>
                        <input type="password" placeholder="New password" />
                    </div>
                    <div className={styles.account__field}>
                        <label>Confirm password</label>
                        <input type="password" placeholder="Confirm" />
                    </div>
                </div>

                <button className={styles.account__btn}>Change password</button>
            </div>
        </div>
    );
};
