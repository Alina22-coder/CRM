import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { AutoAssignSettings } from "../../components/AutoAssignSettings/AutoAssignSettings.component";
import { OverdueSettings } from "../../components/OverdueSettings/OverdueSettings.component";
import styles from "./SettingsPage.module.scss";

function SettingsPage() {
    return (
        <div className={styles.settings__page}>
            <Header />
            <div className={styles.settings__content}>
                <AutoAssignSettings />
                <OverdueSettings />
            </div>
            <Footer />
        </div>
    );
}

export default SettingsPage;
