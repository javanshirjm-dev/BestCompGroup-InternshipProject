import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./Layout";
import Home from "./Features/Pages/Products";
import Dashboard from "./Features/Pages/Dashboard";
import Discount from "./Features/Pages/Discount";
import Settings from "./Features/Pages/Settings";
import Edit from "./Features/Pages/Edit";
import ProductDetail from "./Features/Pages/Products/Detail"
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to='/products' replace />
    },
    {
        element: <Layout />,
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
    }
])