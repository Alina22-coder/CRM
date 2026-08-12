import { useEffect, useRef, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationBell.module.scss";
import { notificationService } from "../../../services/notification.service";
import type { INotification } from "../../../interfaces/INotification";
import { NOTIFICATION_EVENT_LABELS } from "../../../interfaces/ITelegram";

const POLL_INTERVAL_MS = 30000;

export const NotificationBell: FC = () => {
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchUnreadCount = () => {
        notificationService
            .getUnreadCount()
            .then(({ data }) => setUnreadCount(data.count))
            .catch(() => {});
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        const next = !open;
        setOpen(next);

        if (next) {
            setLoading(true);
            notificationService
                .getNotifications({ page: 1, pageSize: 20 })
                .then(({ data }) => setNotifications(data.data))
                .finally(() => setLoading(false));
        }
    };

    const handleNotificationClick = (notification: INotification) => {
        if (!notification.read) {
            notificationService.markRead(notification._id).then(() => {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n._id === notification._id ? { ...n, read: true } : n,
                    ),
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            });
        }

        setOpen(false);
        navigate("/orders");
    };

    const handleMarkAllRead = () => {
        notificationService.markAllRead().then(() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        });
    };

    return (
        <div className={styles.bell} ref={containerRef}>
            <button className={styles.bell__trigger} onClick={handleToggle}>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.bell__badge}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className={styles.bell__dropdown}>
                    <div className={styles.dropdown__header}>
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className={styles.dropdown__list}>
                        {loading ? (
                            <div className={styles.dropdown__empty}>
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.dropdown__empty}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`${styles.dropdown__item} ${
                                        !notification.read
                                            ? styles.dropdown__item__unread
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    <div className={styles.item__event}>
                                        {NOTIFICATION_EVENT_LABELS[
                                            notification.event
                                        ] ?? notification.event}
                                    </div>
                                    <div className={styles.item__text}>
                                        {notification.text}
                                    </div>
                                    <div className={styles.item__date}>
                                        {new Date(
                                            notification.createdAt,
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
