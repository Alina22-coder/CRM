import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

export const Footer = () => {
    return (
        <div className={styles.footer}>
            <Link to="/orders">
                <div className={styles.footer__logo}>
                    CRM<span>Pro</span>
                </div>
            </Link>
            <div>footer</div>
            <div className={styles.footer__version}>v1.0.0</div>
        </div>
    );
};
