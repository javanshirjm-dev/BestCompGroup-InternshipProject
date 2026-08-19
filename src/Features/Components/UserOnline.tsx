import { Navigate, Outlet } from "react-router";

export default function UserOnline({ children }: React.PropsWithChildren) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/auth/login" />;
    return children ?? <Outlet />;
}