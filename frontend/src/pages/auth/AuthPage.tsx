import { Outlet } from "react-router-dom";

function AuthPage() {
    return (
        <>
            <div>Auth Page !</div>
            <Outlet />
        </>
    );
}

export default AuthPage;
