import { Outlet, Navigate } from "react-router-dom";

function AuthPage() {
    const token = localStorage.getItem("accessToken");

    if (token) {
        return <Navigate to="/orders" replace />;
    }

    return (
        <>
            <Outlet />
        </>
    );
}

export default AuthPage;
