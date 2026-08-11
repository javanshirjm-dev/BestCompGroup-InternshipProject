import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./Layout";
import Home from "./Features/Pages/Products";
import Dashboard from "./Features/Pages/Dashboard";
import Discount from "./Features/Pages/Discount";
import Login from "./Features/Pages/Login";
import Register from "./Features/Pages/Register";
import Settings from "./Features/Pages/Settings";
import Edit from "./Features/Pages/Edit";
import ProductDetail from "./Features/Pages/Products/Detail"
import UserOnline from "./Features/Components/UserOnline";
import UserOffline from "./Features/Components/UserOffline";
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
                path: "/discount",
                element: <Discount />,
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
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
        ]
    }
])