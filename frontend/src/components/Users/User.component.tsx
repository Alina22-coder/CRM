import type { FC } from "react";
import type { IUser } from "../../interfaces/IUser";
import styles from "./User.module.scss";
import { AVATAR_COLORS } from "../../constants/avatar.constant";

const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

type UserPropType = {
    user: IUser;
};

export const User: FC<UserPropType> = ({ user }) => {
    return (
        <div className={styles.manager__card}>
            <div
                className={styles.card__avatar}
                style={{ background: getAvatarColor(user.name ?? "") }}
            >
                {user?.name?.charAt(0).toUpperCase()}
                {user?.surname?.charAt(0).toUpperCase()}
            </div>

            <div className={styles.card__info}>
                <div className={styles.info__user}>
                    <div className={styles.card__user}>
                        {user.name} {user.surname}
                    </div>

                    <div
                        className={`${styles.card__status} ${user.is_active ? styles.card__status__active : styles.card__status__inactive}`}
                    >
                        {user.is_active ? "Active" : "Inactive"}
                    </div>
                </div>

                <div className={styles.info__meta}>
                    <div className={styles.info__meta__id}>id: {user._id}</div>
                    <div className={styles.info__meta__email}>{user.email}</div>
                    <div className={styles.info__meta__login}>
                        last login:
                        {user.last_login
                            ? new Date(user.last_login).toLocaleDateString()
                            : "Never"}
                    </div>
                </div>
            </div>

            <div className={styles.card__btn}>
                {user.is_active ? (
                    <button className="btn-recovery">RECOVERY PASSWORD</button>
                ) : (
                    <button className="btn-activate">ACTIVATE</button>
                )}

                <button className="btn-unban">UNBAN</button>

                <button className="btn-ban">BAN</button>
            </div>
        </div>
    );
};
