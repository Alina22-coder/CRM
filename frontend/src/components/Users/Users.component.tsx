import { useEffect, useState } from "react";
import type { IUser } from "../../interfaces/IUser";
import userService from "../../services/users.service";
import { orderService } from "../../services/orders.service";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogoLoader } from "../Logo/Logo";
import { User } from "./User.component";
import styles from "./Users.module.scss";
import type { IStatistic } from "../../interfaces/IStatistic";
import { CreateManagerModal } from "../Modal/CreateManagerModal.component";
import { Pagination } from "../Pagination/Pagination";

export const Users = () => {
    const navigate = useNavigate();

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
                                        icon: "📋",
                                        colorVar: "dark",
                                    },
                                    {
                                        label: "In work",
                                        value: statistic?.["In work"],
                                        icon: "⚙️",
                                        colorVar: "primary",
                                    },
                                    {
                                        label: "New",
                                        value: statistic?.New,
                                        icon: "✨",
                                        colorVar: "yellow",
                                    },
                                    {
                                        label: "Agree",
                                        value: statistic?.Agree,
                                        icon: "✅",
                                        colorVar: "green",
                                    },
                                    {
                                        label: "Disagree",
                                        value: statistic?.Disagree,
                                        icon: "✕",
                                        colorVar: "pink",
                                    },
                                    {
                                        label: "Dubbing",
                                        value: statistic?.Dubbing,
                                        icon: "🎬",
                                        colorVar: "purple",
                                    },
                                    {
                                        label: "Overdue",
                                        value: statistic?.overdueCount,
                                        icon: "⏰",
                                        colorVar: "pinkDark",
                                    },
                                ] as const
                            ).map(({ label, value, icon, colorVar }) => (
                                <div
                                    key={label}
                                    className={styles.status__item}
                                >
                                    <div
                                        className={`${styles.status__item__icon} ${styles[`status__item__icon--${colorVar}`]}`}
                                    >
                                        {icon}
                                    </div>
                                    <div className={styles.status__item__body}>
                                        <div
                                            className={
                                                styles.status__item__title
                                            }
                                        >
                                            {label}
                                        </div>
                                        <div
                                            className={`${styles.status__item__text} ${styles[`status__item__text--${colorVar}`]}`}
                                        >
                                            {value ?? "0"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.admin__panel__actions}>
                        <button
                            className={styles.admin__panel__btn}
                            onClick={() => setIsModalOpen(true)}
                        >
                            + Create manager
                        </button>

                        <button
                            className={styles.admin__panel__btn_secondary}
                            onClick={() => navigate("/admin/history")}
                        >
                            Activity Log
                        </button>

                        <button
                            className={styles.admin__panel__btn_secondary}
                            onClick={() => navigate("/admin/loss-report")}
                        >
                            Loss Report
                        </button>

                        <button
                            className={styles.admin__panel__btn_secondary}
                            onClick={() => navigate("/admin/settings")}
                        >
                            Settings
                        </button>
                    </div>

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
