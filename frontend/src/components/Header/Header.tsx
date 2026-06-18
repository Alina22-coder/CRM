import { useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { useCurrentUser } from "../../hooks/useCurrectUser";
import { authService } from "../../services/auth.service";
import RoleEnum from "../../enums/role.enum";
import { Logo } from "../Logo/Logo";

export const Header = () => {
    const navigate = useNavigate();
    const user = useCurrentUser();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            navigate("/auth/login");
        }
    };

    return (
        <div className={styles.header}>
            <Logo />
            
            <div>
                {user?.name} {user?.surname}
                {user?.role === RoleEnum.Admin && (
                    <button onClick={() => navigate("/admin")}>Адмінка</button>
                )}
            </div>

            <button onClick={handleLogout}>LogOut</button>
        </div>
    );
};
