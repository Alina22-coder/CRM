import { useNavigate } from "react-router-dom";
import "./Header.scss";

function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        navigate("/auth/login");
    };

    return (
        <div className="header">
            <div>logo</div>
            <div>account</div>

            <button onClick={handleLogout}>LogOut</button>
        </div>
    );
}

export default Header;
