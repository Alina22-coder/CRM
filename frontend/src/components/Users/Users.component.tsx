import { useEffect, useState } from "react";
import type { IUser } from "../../interfaces/IUser";
import userService from "../../services/users.service";
import { useSearchParams } from "react-router-dom";
import { LogoLoader } from "../Logo/Logo";
import { User } from "./User.component";
import styles from "./Users.module.scss";

export const Users = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [total, setTotal] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);

    const page = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        setLoading(true);
        userService
            .getAllUsers({ page, pageSize: 25 })
            .then((data) => {
                setUsers(data.data.data);
                setTotal(data.data.data);
            })
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <div>
            {loading ? (
                <LogoLoader />
            ) : (
                <div className={styles.admin__panel}>
                    <button className={styles.admin__panel__btn}>
                        + Create manager
                    </button>

                    <div className={styles.manager}>
                        <div className={styles.manager__list}>
                            {users.map((user) => (
                                <User key={user._id} user={user} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
