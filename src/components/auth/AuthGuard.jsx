import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 

export default function AuthGuard(props) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/SignIn" />;
    }

    return <Outlet />;
}