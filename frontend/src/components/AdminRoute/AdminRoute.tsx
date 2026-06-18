import type { ReactNode } from "react";
import RoleEnum from "../../enums/role.enum";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrectUser";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
    const user = useCurrentUser();

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (user.role !== RoleEnum.Admin) {
        return <Navigate to="/orders" replace />;
    }

    return children;
};
