import { Button } from "../ui/button/Button.ui";
import styles from "./ConfirmModal.module.scss";

export type ConfirmModalProps = {
    isOpen: boolean;
    message: string;
    description: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
};

export const ConfirmModal = ({
    isOpen,
    message,
    description,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.confirm}>
                <div className={styles.confirm__title}>{message}</div>
                <div className={styles.confirm__description}>{description}</div>
                <div className={styles.confirm__actions}>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm}>
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};
