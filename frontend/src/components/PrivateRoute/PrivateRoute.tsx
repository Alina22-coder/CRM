import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const token = localStorage.getItem("accessToken");
    return token ? children : <Navigate to="/auth/login" replace />;
};
