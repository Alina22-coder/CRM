import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { Users } from "../../components/Users/Users.component";
import styles from "./UsersPage.module.scss";

function UsersPage() {
    return (
        <div className={styles.users__page}>
            <Header />
            <Users />
            <Footer />
        </div>
    );
}

export default UsersPage;
