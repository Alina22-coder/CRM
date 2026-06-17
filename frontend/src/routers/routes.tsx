import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import UsersPage from "../pages/users/UsersPage";
import OrdersPage from "../pages/orders/OrdersPage";
import AuthPage from "../pages/auth/AuthPage";
import PrivateRoute from "../components/PrivateRoute";
import LoginPage from "../pages/auth/LoginPage";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "auth",
                element: <AuthPage />,
                children: [
                    {
                        path: "login",
                        element: <LoginPage />,
                    },
                ],
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
