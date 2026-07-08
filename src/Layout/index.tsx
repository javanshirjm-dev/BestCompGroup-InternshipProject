import Footer from './Footer'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router'

const Layout = () => {
    return (
        <div className="min-h-screen grid grid-cols-[74px_1fr]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-dvh">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Layout