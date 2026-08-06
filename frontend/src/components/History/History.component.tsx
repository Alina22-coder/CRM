import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { historyService } from "../../services/history.service";
import userService from "../../services/users.service";
import type { IHistory } from "../../interfaces/IHistory";
import type { IUser } from "../../interfaces/IUser";
import { LogoLoader } from "../Logo/Logo";
import { Pagination } from "../Pagination/Pagination";
import {
    formatHistoryText,
    getHistoryAuthor,
    getHistoryOrder,
} from "../../helpers/formatHistoryEntry";
import styles from "./History.module.scss";

export const History = () => {
    const [entries, setEntries] = useState<IHistory[]>([]);
    const [total, setTotal] = useState(0);
    const [managers, setManagers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const author = searchParams.get("author") || "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";

    const totalPages = Math.ceil(total / 25);

    const updateParam = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        next.set("page", "1");
        setSearchParams(next);
    };

    const handlePageChange = (newPage: number) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(newPage));
        setSearchParams(next);
    };

    const handleReset = () => {
        setSearchParams({});
    };

    useEffect(() => {
        userService.getAllUsers({ page: 1, pageSize: 100 }).then((res) => {
            setManagers(res.data.data ?? []);
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        historyService
            .getAllHistory({
                page,
                pageSize: 25,
                author: author || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            })
            .then((res) => {
                setEntries(res.data.data ?? []);
                setTotal(res.data.total ?? 0);
            })
            .finally(() => setLoading(false));
    }, [page, author, startDate, endDate]);

    return (
        <div className={styles.history__page}>
            <Link className={styles.history__back} to="/admin">
                ← Back to Admin Panel
            </Link>

            <div className={styles.history__filters}>
                <select
                    className={styles.history__filter__select}
                    value={author}
                    onChange={(e) => updateParam("author", e.target.value)}
                >
                    <option value="">all users</option>
                    {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                            {manager.name} {manager.surname}
                        </option>
                    ))}
                </select>

                <input
                    className={styles.history__filter__input}
                    type="date"
                    value={startDate}
                    onChange={(e) => updateParam("start_date", e.target.value)}
                />
                <input
                    className={styles.history__filter__input}
                    type="date"
                    value={endDate}
                    onChange={(e) => updateParam("end_date", e.target.value)}
                />

                <button
                    className={styles.history__filter__reset}
                    onClick={handleReset}
                >
                    Reset
                </button>
            </div>

            {loading ? (
                <LogoLoader />
            ) : (
                <>
                    <div className={styles.history__list}>
                        {entries.length === 0 && (
                            <div className={styles.history__empty}>
                                No events
                            </div>
                        )}

                        {entries.map((entry) => {
                            const entryAuthor = getHistoryAuthor(entry);
                            const order = getHistoryOrder(entry);

                            return (
                                <div
                                    key={entry._id}
                                    className={styles.history__item}
                                >
                                    <div className={styles.history__item__row}>
                                        <div
                                            className={
                                                styles.history__item__author
                                            }
                                        >
                                            {entryAuthor
                                                ? `${entryAuthor.name} ${entryAuthor.surname}`
                                                : ""}
                                        </div>
                                        <div
                                            className={
                                                styles.history__item__date
                                            }
                                        >
                                            {new Date(
                                                entry.created_at,
                                            ).toLocaleString()}
                                        </div>
                                    </div>

                                    {order && (
                                        <div
                                            className={
                                                styles.history__item__order
                                            }
                                        >
                                            {order.name} {order.surname} ·{" "}
                                            {order.email}
                                        </div>
                                    )}

                                    <div
                                        className={styles.history__item__text}
                                    >
                                        {formatHistoryText(entry)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Pagination
                        page={page}
                        totalPage={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};
