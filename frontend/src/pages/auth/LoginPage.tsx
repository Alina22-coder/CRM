import { LoginForm } from "../../components/Forms/LoginForm";
import styles from "./LoginPage.module.scss";

function LoginPage() {
    return (
        <div className={styles.login__page}>
            <LoginForm />
        </div>
    );
}

export default LoginPage;
