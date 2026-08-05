import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { LossReport } from "../../components/LossReport/LossReport.component";
import styles from "./LossReportPage.module.scss";

function LossReportPage() {
    return (
        <div className={styles.loss_report__page}>
            <Header />
            <LossReport />
            <Footer />
        </div>
    );
}

export default LossReportPage;
