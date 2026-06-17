import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";
import type { ITokenPayload } from "../../interfaces/IToken";
import RoleEnum from "../../enums/role.enum";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    const decoded = jwtDecode<ITokenPayload>(token);

    console.log(decoded);

    if (decoded.role !== RoleEnum.Admin) {
        return <Navigate to="/orders" replace />;
    }

    return children;
};
