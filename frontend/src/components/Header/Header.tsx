import { useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";

export const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        navigate("/auth/login");
    };

    return (
        <div className={styles.header}>
            <div>logo</div>
            <div>account</div>

            <button onClick={handleLogout}>LogOut</button>
        </div>
    );
};
