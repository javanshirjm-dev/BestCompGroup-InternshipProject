import Footer from './Footer'
import { Outlet } from 'react-router'

const Layout = () => {
    return (
        <main className="min-h-screen">
            <Outlet />
            <Footer />
        </main>
    )
}

export default Layout