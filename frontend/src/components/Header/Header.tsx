import { Link, useNavigate } from "react-router-dom";
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
            <Link to="/orders">
                <Logo />
            </Link>

            <div className={styles.header__content}>
                <div className={styles.header__search}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        className={styles.search__input}
                        type="text"
                        placeholder="Search orders, managers..."
                    />
                </div>

                <button className={styles.header__notification}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </button>

                <div className={styles.header__account}>
                    <Link to="/account">
                        <div className={styles.header__profile}>
                            <div className={styles.user__avatar}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.user__name}>
                                {user?.name}
                            </div>
                        </div>
                    </Link>

                    <div className={styles.header__panel}>
                        {user?.role === RoleEnum.Admin && (
                            <button
                                className={styles.panel__admin}
                                onClick={() => navigate("/admin")}
                            >
                                Admin Panel
                            </button>
                        )}
                    </div>
                </div>

                <button
                    className={styles.header__logout}
                    onClick={handleLogout}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};
