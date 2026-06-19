import { Orders } from "../../components/Orders/Orders.component";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { OrderFilters } from "../../components/Orders/OrderFilters.component";

function OrdersPage() {
    return (
        <>
            <Header />
            <OrderFilters />
            <Orders />
            <Footer />
        </>
    );
}

export default OrdersPage;
