import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./Layout";
import Home from "./Features/Pages/Products";
import Shop from "./Features/Pages/Shop";
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
                path: "/shop",
                element: <Shop />,
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