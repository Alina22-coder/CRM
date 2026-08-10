import { useEffect, useState } from "react";
import { toast } from "sonner";
import { overdueSettingsService } from "../../services/overdueSettings.service";
import { LogoLoader } from "../Logo/Logo";
import styles from "./OverdueSettings.module.scss";

export const OverdueSettings = () => {
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [thresholdHours, setThresholdHours] = useState(24);

    useEffect(() => {
        setLoading(true);
        overdueSettingsService
            .getSettings()
            .then((res) => {
                setEnabled(res.data.enabled);
                setThresholdHours(res.data.thresholdHours);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleToggleEnabled = () => {
        const next = !enabled;
        setEnabled(next);
        overdueSettingsService.updateSettings({ enabled: next }).catch(() => {
            toast.error("Failed to update overdue detection status");
            setEnabled(!next);
        });
    };

    const handleThresholdBlur = () => {
        overdueSettingsService
            .updateSettings({ thresholdHours })
            .catch(() => {
                toast.error("Failed to update threshold");
            });
    };

    return (
        <div className={styles.overdue}>
            <div className={styles.overdue__title}>
                Overdue orders settings
            </div>

            {loading ? (
                <LogoLoader />
            ) : (
                <>
                    <label className={styles.overdue__toggle}>
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={handleToggleEnabled}
                        />
                        Automatically flag overdue orders
                    </label>

                    <div className={styles.overdue__section}>
                        <div className={styles.overdue__label}>
                            Threshold (hours in New status without a comment)
                        </div>
                        <input
                            className={styles.overdue__input}
                            type="number"
                            min={1}
                            value={thresholdHours}
                            onChange={(e) =>
                                setThresholdHours(Number(e.target.value))
                            }
                            onBlur={handleThresholdBlur}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
