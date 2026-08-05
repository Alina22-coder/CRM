import { useEffect, useState } from "react";
import { useCurrentUser } from "../../hooks/useCurrectUser";
import { telegramService } from "../../services/telegram.service";
import {
    NOTIFICATION_EVENT_LABELS,
    type NotificationEvent,
} from "../../interfaces/ITelegram";
import { toast } from "sonner";
import styles from "./Account.module.scss";

const NOTIFICATION_EVENTS = Object.keys(
    NOTIFICATION_EVENT_LABELS,
) as NotificationEvent[];

export const Account = () => {
    const user = useCurrentUser();

    const [chatId, setChatId] = useState<string | null | undefined>(
        user?.telegram_chat_id,
    );
    const [preferences, setPreferences] = useState<
        Partial<Record<NotificationEvent, boolean>>
    >(user?.telegram_notifications ?? {});
    const [linkCode, setLinkCode] = useState<string | null>(null);
    const [isLinking, setIsLinking] = useState(false);

    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

    useEffect(() => {
        telegramService.getStatus().then((res) => {
            setChatId(res.data.telegram_chat_id);
            setPreferences(res.data.telegram_notifications ?? {});
        });
    }, []);

    const handleGetLinkCode = () => {
        setIsLinking(true);
        telegramService
            .getLinkCode()
            .then((res) => setLinkCode(res.data.code))
            .catch(() => toast.error("Failed to generate code"))
            .finally(() => setIsLinking(false));
    };

    const handleUnlink = () => {
        telegramService
            .unlink()
            .then(() => {
                setChatId(null);
                setLinkCode(null);
                toast.success("Telegram account unlinked");
            })
            .catch(() => toast.error("Failed to unlink account"));
    };

    const handleTogglePreference = (event: NotificationEvent) => {
        const next = { ...preferences, [event]: !preferences[event] };
        setPreferences(next);
        telegramService
            .updatePreferences({ [event]: next[event] })
            .catch(() => {
                toast.error("Failed to save preferences");
                setPreferences(preferences);
            });
    };

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

            <div className={styles.account__block}>
                <div className={styles.account__title}>
                    Telegram notifications
                </div>

                {chatId ? (
                    <>
                        <div className={styles.telegram__status}>
                            Telegram account linked
                        </div>

                        <div className={styles.telegram__preferences}>
                            {NOTIFICATION_EVENTS.map((event) => (
                                <label
                                    key={event}
                                    className={styles.telegram__preference}
                                >
                                    <input
                                        type="checkbox"
                                        checked={preferences[event] ?? false}
                                        onChange={() =>
                                            handleTogglePreference(event)
                                        }
                                    />
                                    {NOTIFICATION_EVENT_LABELS[event]}
                                </label>
                            ))}
                        </div>

                        <button
                            className={styles.account__btn}
                            onClick={handleUnlink}
                        >
                            Unlink Telegram
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.telegram__status}>
                            Telegram account not linked
                        </div>

                        {linkCode ? (
                            <div className={styles.telegram__link}>
                                <div className={styles.telegram__code}>
                                    Code: {linkCode}
                                </div>

                                <a
                                    className={styles.telegram__link__btn}
                                    href={`https://t.me/${botUsername}?start=${linkCode}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open bot
                                </a>
                            </div>
                        ) : (
                            <button
                                className={styles.account__btn}
                                onClick={handleGetLinkCode}
                                disabled={isLinking}
                            >
                                Link Telegram
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
