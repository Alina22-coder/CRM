import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { AutoAssignSettings } from "../../components/AutoAssignSettings/AutoAssignSettings.component";
import styles from "./SettingsPage.module.scss";

function SettingsPage() {
    return (
        <div className={styles.settings__page}>
            <Header />
            <AutoAssignSettings />
            <Footer />
        </div>
    );
}

export default SettingsPage;
