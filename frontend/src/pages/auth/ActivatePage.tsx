import { ActivateForm } from "../../components/Forms/ActivateFrom";
import styles from "./ActivatePage.module.scss";

function ActivatePage() {
    return (
        <div className={styles.activate__page}>
            <ActivateForm />
        </div>
    );
}

export default ActivatePage;
