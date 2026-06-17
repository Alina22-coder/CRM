import { Outlet } from "react-router-dom";
import Orders from "../../components/Orders/Orders";

function OrdersPage() {
    return (
        <>
            <div>Orders Page !</div>
            <Orders />
            <Outlet />
        </>
    );
}

export default OrdersPage;
