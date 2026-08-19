import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./Layout";
import Home from "./Features/Pages/Products";
import Dashboard from "./Features/Pages/Dashboard";
import Discount from "./Features/Pages/Blog";
import Login from "./Features/Pages/Login";
import Register from "./Features/Pages/Register";
import Settings from "./Features/Pages/Settings";
import Edit from "./Features/Pages/Edit";
import ForgotPassword from "./Features/Pages/ForgotPassword";
import ProductDetail from "./Features/Pages/Products/Detail"
import UserOnline from "./Features/Components/UserOnline";
import UserOffline from "./Features/Components/UserOffline";
import ResetPassword from "./Features/Pages/ResetPassword";
import Blog from "./Features/Pages/Blog";


export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to='/products' replace />
    },
    {
        element: <UserOnline><Layout /></UserOnline>,
        children: [
            {
                path: "/products",
                element: < Home />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/blog",
                element: <Blog />,
            },
            {
                path: "/settings",
                element: <Settings />,
            },
            {
                path: "/products/:id/edit",
                element: <Edit />,
            },
            {
                path: "/products/add",
                element: <Edit />,
            },
            {
                path: "/products/:id",
                element: <ProductDetail />,
            }

        ]
    },
    {
        element: <UserOffline />,
        path: '/auth',
        children: [
            {
                path: "/auth/login",
                element: <Login />,
            },
            {
                path: "/auth/register",
                element: <Register />,
            },
            {
                path: "/auth/forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: "/auth/reset-password",
                element: <ResetPassword />,
            },
        ]
    }
])