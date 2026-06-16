import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

function PrivateRoute({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("accessToken");
    return token ? children : <Navigate to="/auth" replace />;
}

export default PrivateRoute;
