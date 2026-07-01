import { useEffect, useState } from "react";
import type { IUser } from "../../interfaces/IUser";
import userService from "../../services/users.service";
import { orderService } from "../../services/orders.service";
import { useSearchParams } from "react-router-dom";
import { LogoLoader } from "../Logo/Logo";
import { User } from "./User.component";
import styles from "./Users.module.scss";
import type { IStatistic } from "../../interfaces/IStatistic";
import { CreateManagerModal } from "../Modal/CreateManagerModal.component";
import { Pagination } from "../Pagination/Pagination";

export const Users = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [total, setTotal] = useState(0);
    const [statistic, setStatistic] = useState<IStatistic | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const page = Number(searchParams.get("page")) || 1;

    const totalPages = Math.ceil(total / 25);

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: String(newPage) });
    };

    const loadUsers = () => {
        userService.getAllUsers({ page, pageSize: 25 }).then((usersData) => {
            setUsers(usersData.data.data);
            setTotal(usersData.data.total);
        });
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            userService.getAllUsers({ page, pageSize: 25 }),
            orderService.getOrderStatistic(),
        ])
            .then(([usersData, statData]) => {
                setUsers(usersData.data.data);
                setTotal(usersData.data.total);
                setStatistic(statData.data);
            })
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <div>
            {loading ? (
                <LogoLoader />
            ) : (
                <div className={styles.admin__panel}>
                    <div className={styles.status__banner}>
                        <div className={styles.status__banner__title}>
                            Orders statistic
                        </div>

                        <div className={styles.status__list}>
                            {(
                                [
                                    {
                                        label: "Total",
                                        value: statistic?.total,
                                        color: "#1c1d21",
                                    },
                                    {
                                        label: "In work",
                                        value: statistic?.["In work"],
                                        color: "#5e81f4",
                                    },
                                    {
                                        label: "New",
                                        value: statistic?.New,
                                        color: "#f4be5e",
                                    },
                                    {
                                        label: "Agree",
                                        value: statistic?.Aggre,
                                        color: "#7ce7ac",
                                    },
                                    {
                                        label: "Disagree",
                                        value: statistic?.Disaggre,
                                        color: "#ff808b",
                                    },
                                    {
                                        label: "Dubbing",
                                        value: statistic?.Dubbing,
                                        color: "#9698d6",
                                    },
                                ] as const
                            ).map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    className={styles.status__item}
                                >
                                    <div className={styles.status__item__wrap}>
                                        <div
                                            className={styles.status__item__dot}
                                            style={{ background: color }}
                                        ></div>
                                        <div
                                            className={
                                                styles.status__item__title
                                            }
                                        >
                                            {label}
                                        </div>
                                    </div>
                                    <div
                                        className={styles.status__item__text}
                                        style={{ color: color }}
                                    >
                                        {value ?? "0"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className={styles.admin__panel__btn}
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Create manager
                    </button>

                    <CreateManagerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={loadUsers}
                    />

                    <div className={styles.manager}>
                        <div className={styles.manager__list}>
                            {users.map((user) => (
                                <User
                                    key={user._id}
                                    user={user}
                                    onUpdate={loadUsers}
                                />
                            ))}
                        </div>
                    </div>

                    <Pagination
                        page={page}
                        totalPage={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};
