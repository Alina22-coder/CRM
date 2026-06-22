import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import UsersPage from "../pages/users/UsersPage";
import OrdersPage from "../pages/orders/OrdersPage";
import AuthPage from "../pages/auth/AuthPage";
import { PrivateRoute } from "../components/PrivateRoute/PrivateRoute";
import LoginPage from "../pages/auth/LoginPage";
import { AdminRoute } from "../components/AdminRoute/AdminRoute";
import SetPasswordPage from "../pages/auth/SetPasswordPage";
import AccountPage from "../pages/account/AccountPage";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Navigate to="/auth/login" replace />,
            },
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
                path: "set-password",
                element: <SetPasswordPage />,
            },
            {
                path: "admin",
                element: (
                    <PrivateRoute>
                        <AdminRoute>
                            <UsersPage />
                            {/* <EditOrderModal /> */}
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

            {
                path: "account",
                element: (
                    <PrivateRoute>
                        <AccountPage />
                    </PrivateRoute>
                ),
            },
        ],
    },
]);

export default routes;
