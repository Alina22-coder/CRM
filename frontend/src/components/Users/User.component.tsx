import { useState, type FC } from "react";
import type { IUser } from "../../interfaces/IUser";
import styles from "./User.module.scss";
import userService from "../../services/users.service";
import { authService } from "../../services/auth.service";
import { toast } from "sonner";
import { ConfirmModal } from "../Modal/ConfirmModal.component";
import type { IStatistic } from "../../interfaces/IStatistic";
import RoleEnum from "../../enums/role.enum";

const ROLE_META: Record<RoleEnum, { colorVar: string; label: string }> = {
    [RoleEnum.Admin]: { colorVar: "purple", label: "Admin" },
    [RoleEnum.Manager]: { colorVar: "primary", label: "Manager" },
};

type UserPropType = {
    user: IUser;
    statistic?: IStatistic;
    onUpdate: () => void;
};

export const User: FC<UserPropType> = ({ user, statistic, onUpdate }) => {
    const [confirm, setConfirm] = useState<{
        message: string;
        description: React.ReactNode;
        action: () => void;
    } | null>(null);

    const stats = [
        { label: "Total", value: statistic?.total },
        { label: "In work", value: statistic?.["In work"] },
        { label: "New", value: statistic?.New },
        { label: "Agree", value: statistic?.Agree },
        { label: "Disagree", value: statistic?.Disagree },
        { label: "Dubbing", value: statistic?.Dubbing },
    ];

    const copyLink = async (token: string, label: string) => {
        const link = `${window.location.origin}/activate/${token}`;
        try {
            await navigator.clipboard.writeText(link);
            toast.success(`${label} link copied to clipboard`);
        } catch {
            toast.warning(`${label} link generated, but couldn't be copied`, {
                description: link,
                duration: 30_000,
            });
        }
    };

    const handleRecovery = async () => {
        try {
            const { data } = await authService.recovery(user._id);
            await copyLink(data.token, "Recovery");
        } catch {
            toast.error("Failed to generate recovery link");
        }
    };

    const handleActivate = async () => {
        try {
            const { data } = await authService.activate(user._id);
            await copyLink(data.token, "Activation");
        } catch {
            toast.error("Failed to generate activation link");
        }
    };

    const handleBan = async () => {
        try {
            await userService.banUser(user._id);
            toast.success("User has been banned");
            onUpdate();
        } catch {
            toast.error("Failed to ban user");
        }
    };

    const handleUnban = async () => {
        try {
            await userService.unbanUser(user._id);
            toast.success("User has been unbanned");
            onUpdate();
        } catch {
            toast.error("Failed to unban user");
        }
    };

    const roleMeta = ROLE_META[user.role];

    return (
        <div className={styles.manager__card}>
            <div
                className={`${styles.card__avatar} ${styles[`card__avatar--${roleMeta.colorVar}`]}`}
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
                        className={`${styles.card__role} ${styles[`card__role--${roleMeta.colorVar}`]}`}
                    >
                        {roleMeta.label}
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
                        last login:{" "}
                        {user.last_login
                            ? new Date(user.last_login).toLocaleDateString()
                            : "Never"}
                    </div>
                </div>

                <div className={styles.card__statistic}>
                    {statistic &&
                        stats.map((s) => (
                            <span key={s.label}>
                                {s.label}: {s.value ?? 0}
                            </span>
                        ))}
                </div>
            </div>

            <div className={styles.card__btn}>
                {user.is_active ? (
                    <button
                        className="btn-recovery"
                        onClick={() =>
                            setConfirm({
                                message: "Recovery password",
                                description: (
                                    <>
                                        Send recovery link to{" "}
                                        <strong>
                                            {user.name} {user.surname}
                                        </strong>
                                        ? The link will be copied to your
                                        clipboard.
                                    </>
                                ),
                                action: handleRecovery,
                            })
                        }
                    >
                        RECOVERY PASSWORD
                    </button>
                ) : (
                    <button
                        className="btn-activate"
                        onClick={() =>
                            setConfirm({
                                message: "Activate user",
                                description: (
                                    <>
                                        Send activation link to{" "}
                                        <strong>
                                            {user.name} {user.surname}
                                        </strong>
                                        ? The link will be copied to your
                                        clipboard.
                                    </>
                                ),
                                action: handleActivate,
                            })
                        }
                    >
                        ACTIVATE
                    </button>
                )}

                <button
                    className="btn-ban"
                    disabled={user.is_banned}
                    onClick={() =>
                        setConfirm({
                            message: "Ban user",
                            description: (
                                <>
                                    Are you sure you want to ban{" "}
                                    <strong>
                                        {user.name} {user.surname}
                                    </strong>
                                    ? They will lose access to the system.
                                </>
                            ),
                            action: handleBan,
                        })
                    }
                >
                    BAN
                </button>

                <button
                    className="btn-unban"
                    disabled={!user.is_banned}
                    onClick={() =>
                        setConfirm({
                            message: "Unban user",
                            description: (
                                <>
                                    Are you sure you want to unban{" "}
                                    <strong>
                                        {user.name} {user.surname}
                                    </strong>
                                    ? They will regain access to the system.
                                </>
                            ),
                            action: handleUnban,
                        })
                    }
                >
                    UNBAN
                </button>
            </div>

            <ConfirmModal
                isOpen={!!confirm}
                message={confirm?.message ?? ""}
                description={confirm?.description ?? ""}
                onConfirm={() => {
                    confirm?.action();
                    setConfirm(null);
                }}
                onCancel={() => setConfirm(null)}
            />
        </div>
    );
};
