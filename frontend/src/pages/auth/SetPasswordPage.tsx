import { SetPasswordForm } from "../../components/Forms/SetPasswordForm";
import styles from "./SetPasswordPage.module.scss";

function SetPasswordPage() {
    return (
        <div className={styles.set_password__page}>
            <SetPasswordForm />
        </div>
    );
}

export default SetPasswordPage;
