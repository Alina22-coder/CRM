import styles from "./CreateManagerModal.module.scss";

type CreateManagerModalType = {
    isOpen: boolean;
    onClose: () => void;
};

export const CreateManagerModal = ({
    isOpen,
    onClose,
}: CreateManagerModalType) => {
    if (!isOpen) return null;
    return (
        <div className={styles.modal__overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <div className={styles.header__title}>New manager</div>
                    {/* TODO add btn */}
                    <button className={styles.header__btn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.modal__main}>
                    <div className={styles.modal__field}>
                        <label>Name</label>
                        <input type="text" placeholder="First name" />
                    </div>
                    <div className={styles.modal__field}>
                        <label>Surname</label>
                        <input type="text" placeholder="Last name" />
                    </div>
                    <div className={styles.modal__field}>
                        <label>Email</label>
                        <input type="text" placeholder="manager@gmail.com" />
                    </div>
                </div>

                <div className={styles.modal__footer}>
                    <button className={styles.footer__cancel} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.footer__create}>Create</button>
                </div>
            </div>
        </div>
    );
};
