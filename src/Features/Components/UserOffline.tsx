import { Navigate, Outlet } from "react-router";

export default function UserOffline({ children }: React.PropsWithChildren) {
    const token = localStorage.getItem("token");
    if (token) return <Navigate to="/products" />;
    return children ?? <Outlet />;
}