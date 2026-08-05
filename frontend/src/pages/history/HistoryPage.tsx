import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { History } from "../../components/History/History.component";
import styles from "./HistoryPage.module.scss";

function HistoryPage() {
    return (
        <div className={styles.history__page}>
            <Header />
            <History />
            <Footer />
        </div>
    );
}

export default HistoryPage;
