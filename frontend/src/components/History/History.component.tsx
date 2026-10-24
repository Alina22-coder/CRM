import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { historyService } from "../../services/history.service";
import userService from "../../services/users.service";
import type { IHistory } from "../../interfaces/IHistory";
import type { IUser } from "../../interfaces/IUser";
import { LogoLoader } from "../Logo/Logo";
import { Pagination } from "../Pagination/Pagination";
import {
    formatHistoryAction,
    formatHistoryValueChange,
    getHistoryAuthor,
    getHistoryOrder,
    getHistoryTypeMeta,
    isHiddenHistoryEntry,
} from "../../helpers/formatHistoryEntry";
import styles from "./History.module.scss";

export const History = () => {
    const [entries, setEntries] = useState<IHistory[]>([]);
    const [total, setTotal] = useState(0);
    const [managers, setManagers] = useState<IUser[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const author = searchParams.get("author") || "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";

    const requestKey = [page, author, startDate, endDate].join("|");
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const loading = loadedKey !== requestKey;

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
        let ignore = false;
        historyService
            .getAllHistory({
                page,
                pageSize: 25,
                author: author || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            })
            .then((res) => {
                if (ignore) return;
                setEntries(res.data.data ?? []);
                setTotal(res.data.total ?? 0);
            })
            .finally(() => {
                if (!ignore) setLoadedKey(requestKey);
            });

        return () => {
            ignore = true;
        };
    }, [page, author, startDate, endDate, requestKey]);

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

                        {entries
                            .filter((entry) => !isHiddenHistoryEntry(entry))
                            .map((entry) => {
                            const entryAuthor = getHistoryAuthor(entry);
                            const order = getHistoryOrder(entry);
                            const meta = getHistoryTypeMeta(entry);
                            const valueChange = formatHistoryValueChange(entry);

                            return (
                                <div
                                    key={entry._id}
                                    className={styles.history__item}
                                >
                                    <div
                                        className={`${styles.history__item__icon} ${styles[`history__item__icon--${meta.colorVar}`]}`}
                                    >
                                        {meta.icon}
                                    </div>

                                    <div
                                        className={styles.history__item__body}
                                    >
                                        <div
                                            className={
                                                styles.history__item__line
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.history__item__author
                                                }
                                            >
                                                {entryAuthor?.surname ?? ""}
                                            </span>{" "}
                                            {formatHistoryAction(entry)}
                                            {order && (
                                                <>
                                                    {" "}
                                                    <Link
                                                        className={
                                                            styles.history__item__order
                                                        }
                                                        to={`/orders?surname=${encodeURIComponent(order.surname)}`}
                                                    >
                                                        #{order._id.slice(-6)}
                                                    </Link>
                                                </>
                                            )}
                                            {valueChange && (
                                                <>
                                                    {" "}
                                                    <span
                                                        className={
                                                            styles.history__item__value
                                                        }
                                                    >
                                                        {valueChange}
                                                    </span>
                                                </>
                                            )}
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
