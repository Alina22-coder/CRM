import { Orders } from "../../components/Orders/Orders.component";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import styles from "./OrdersPage.module.scss";

function OrdersPage() {
    return (
        <div className={styles.orders__page}>
            <Header />
            <Orders />
            <Footer />
        </div>
    );
}

export default OrdersPage;
