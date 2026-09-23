import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrectUser";
import { telegramService } from "../../services/telegram.service";
import userService from "../../services/users.service";
import { authService } from "../../services/auth.service";
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name ?? "");
    const [surname, setSurname] = useState(user?.surname ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [chatId, setChatId] = useState<string | null | undefined>(
        user?.telegram_chat_id,
    );
    const [preferences, setPreferences] = useState<
        Partial<Record<NotificationEvent, boolean>>
    >(user?.telegram_notifications ?? {});
    const [linkCode, setLinkCode] = useState<string | null>(null);
    const [isLinking, setIsLinking] = useState(false);

    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

    const persistUser = (update: Partial<typeof user>) => {
        if (!user) return;
        const next = { ...user, ...update };
        localStorage.setItem("user", JSON.stringify(next));
    };

    const handleSaveProfile = () => {
        if (!user) return;

        setIsSavingProfile(true);
        userService
            .updateUserById(user._id, { name, surname, email })
            .then(() => {
                persistUser({ name, surname, email });
                toast.success("Profile updated");
            })
            .catch((err) => {
                toast.error(
                    err.response?.data?.message ?? "Failed to update profile",
                );
            })
            .finally(() => setIsSavingProfile(false));
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !user) return;

        setIsUploadingAvatar(true);
        userService
            .uploadAvatar(user._id, file)
            .then((res) => {
                setAvatarUrl(res.data.avatarUrl);
                persistUser({ avatarUrl: res.data.avatarUrl });
                toast.success("Photo updated");
            })
            .catch((err) => {
                toast.error(
                    err.response?.data?.message ?? "Failed to upload photo",
                );
            })
            .finally(() => setIsUploadingAvatar(false));
    };

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword) {
            toast.error("Fill in all password fields");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match");
            return;
        }

        setIsChangingPassword(true);
        authService
            .changePassword(currentPassword, newPassword)
            .then(() => {
                // The server ends all sessions after a password change.
                toast.success("Password changed, please log in again");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                navigate("/auth/login");
            })
            .catch((err) => {
                toast.error(
                    err.response?.data?.message ?? "Failed to change password",
                );
            })
            .finally(() => setIsChangingPassword(false));
    };

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
                    {avatarUrl ? (
                        <img
                            className={styles.profile__avatar}
                            src={avatarUrl}
                            alt="Avatar"
                        />
                    ) : (
                        <div className={styles.profile__avatar}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className={styles.profile}>
                        <div className={styles.profile__user}>
                            {user?.name} {user?.surname}
                        </div>
                        <div className={styles.profile__role}>
                            Role: {user?.role}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={handleAvatarSelect}
                        />
                        <button
                            className={styles.profile__upload}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                        >
                            📷{" "}
                            {isUploadingAvatar
                                ? "Uploading..."
                                : "Upload photo"}
                        </button>
                    </div>
                </div>

                <div>
                    <div className={styles.account__field}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.account__field}>
                        <label>Surname</label>
                        <input
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                        />
                    </div>
                    <div className={styles.account__field}>
                        <label>Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className={styles.account__btn}
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                >
                    {isSavingProfile ? "Saving..." : "Save changes"}
                </button>
            </div>

            <div className={styles.account__block}>
                <div className={styles.account__title}>Change password</div>

                <div>
                    <div className={styles.account__field}>
                        <label>Current password</label>
                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                        />
                    </div>
                    <div className={styles.account__field}>
                        <label>New password</label>
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className={styles.account__field}>
                        <label>Confirm password</label>
                        <input
                            type="password"
                            placeholder="Confirm"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                        />
                    </div>
                </div>

                <button
                    className={styles.account__btn}
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                >
                    {isChangingPassword ? "Changing..." : "Change password"}
                </button>
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
