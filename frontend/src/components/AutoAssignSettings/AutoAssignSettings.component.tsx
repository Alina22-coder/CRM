import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { autoAssignService } from "../../services/autoAssign.service";
import userService from "../../services/users.service";
import type { IUser } from "../../interfaces/IUser";
import {
    AUTO_ASSIGN_MODE_LABELS,
    type AutoAssignMode,
} from "../../interfaces/IAutoAssignSettings";
import { LogoLoader } from "../Logo/Logo";
import styles from "./AutoAssignSettings.module.scss";

const MODES = Object.keys(AUTO_ASSIGN_MODE_LABELS) as AutoAssignMode[];

export const AutoAssignSettings = () => {
    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [mode, setMode] = useState<AutoAssignMode>("round_robin");
    const [participantIds, setParticipantIds] = useState<string[]>([]);
    const [managers, setManagers] = useState<IUser[]>([]);

    useEffect(() => {
        Promise.all([
            autoAssignService.getSettings(),
            userService.getAllUsers({ page: 1, pageSize: 100 }),
        ])
            .then(([settingsRes, usersRes]) => {
                setEnabled(settingsRes.data.enabled);
                setMode(settingsRes.data.mode);
                setParticipantIds(settingsRes.data.participantIds ?? []);
                setManagers(usersRes.data.data ?? []);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleToggleEnabled = () => {
        const next = !enabled;
        setEnabled(next);
        autoAssignService.updateSettings({ enabled: next }).catch(() => {
            toast.error("Failed to update auto-assign status");
            setEnabled(!next);
        });
    };

    const handleModeChange = (nextMode: AutoAssignMode) => {
        setMode(nextMode);
        autoAssignService.updateSettings({ mode: nextMode }).catch(() => {
            toast.error("Failed to update auto-assign mode");
        });
    };

    const handleToggleParticipant = (userId: string) => {
        const next = participantIds.includes(userId)
            ? participantIds.filter((id) => id !== userId)
            : [...participantIds, userId];

        setParticipantIds(next);
        autoAssignService
            .updateSettings({ participantIds: next })
            .catch(() => {
                toast.error("Failed to update participants");
                setParticipantIds(participantIds);
            });
    };

    return (
        <div className={styles.auto_assign__page}>
            <Link className={styles.auto_assign__back} to="/admin">
                ← Back to Admin Panel
            </Link>

            <div className={styles.auto_assign}>
                <div className={styles.auto_assign__title}>
                    Auto-assign settings
                </div>

                {loading ? (
                    <LogoLoader />
                ) : (
                    <>
                        <label className={styles.auto_assign__toggle}>
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={handleToggleEnabled}
                            />
                            Enable auto-assign for new orders
                        </label>

                        <div className={styles.auto_assign__section}>
                            <div className={styles.auto_assign__label}>
                                Mode
                            </div>
                            <div className={styles.auto_assign__modes}>
                                {MODES.map((m) => (
                                    <button
                                        key={m}
                                        className={`${styles.auto_assign__mode} ${
                                            mode === m
                                                ? styles[
                                                      "auto_assign__mode--active"
                                                  ]
                                                : ""
                                        }`}
                                        onClick={() => handleModeChange(m)}
                                    >
                                        {AUTO_ASSIGN_MODE_LABELS[m]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.auto_assign__section}>
                            <div className={styles.auto_assign__label}>
                                Participating managers
                            </div>
                            <div className={styles.auto_assign__participants}>
                                {managers
                                    .filter(
                                        (user) => user.role === "manager",
                                    )
                                    .map((manager) => (
                                        <label
                                            key={manager._id}
                                            className={
                                                styles.auto_assign__participant
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                checked={participantIds.includes(
                                                    manager._id,
                                                )}
                                                onChange={() =>
                                                    handleToggleParticipant(
                                                        manager._id,
                                                    )
                                                }
                                            />
                                            {manager.name} {manager.surname}
                                            {!manager.is_active && (
                                                <span
                                                    className={
                                                        styles.auto_assign__participant__badge
                                                    }
                                                >
                                                    inactive
                                                </span>
                                            )}
                                        </label>
                                    ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
