import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import UsersPage from "../pages/users/UsersPage";
import OrdersPage from "../pages/orders/OrdersPage";
import AuthPage from "../pages/auth/AuthPage";
import { PrivateRoute } from "../components/PrivateRoute/PrivateRoute";
import LoginPage from "../pages/auth/LoginPage";
import { AdminRoute } from "../components/AdminRoute/AdminRoute";

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
                        <AdminRoute>
                            <UsersPage />
                        </AdminRoute>
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
