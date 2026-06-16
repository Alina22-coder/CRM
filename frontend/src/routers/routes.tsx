import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import UsersPage from "../pages/users/UsersPage";
import OrdersPage from "../pages/orders/OrdersPage";
import AuthPage from "../pages/auth/AuthPage";
import PrivateRoute from "../components/PrivateRoute";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "auth",
                element: <AuthPage />,
            },
            {
                path: "users",
                element: (
                    <PrivateRoute>
                        <UsersPage />
                    </PrivateRoute>
                ),
            },
            {
                path: "orders",
                element: (
                    <PrivateRoute>
                        <OrdersPage />
                    </PrivateRoute>
                ),
            },
        ],
    },
]);

export default routes;
