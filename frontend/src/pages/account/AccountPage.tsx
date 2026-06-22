import { Account } from "../../components/Account/Account.component";
import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import styles from "./AccountPage.module.scss";

function AccountPage() {
    return (
        <div className={styles.account__page}>
            <Header />
            <Account />
            <Footer />
        </div>
    );
}

export default AccountPage;
