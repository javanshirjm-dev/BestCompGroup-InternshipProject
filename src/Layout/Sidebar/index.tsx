import { Link } from "react-router"
import { LayoutGrid, Package, Settings } from "lucide-react"
import { NavbarItem } from "../../Constants/NavbarItem"
import type { NavbarItems } from "../../Types/Global"

const Sidebar = () => {

    return (
        <aside className="bg-[#f9f9fa] overflow-y-auto h-dvh border-r border-gray-200">
            <ul className="flex flex-col p-6 gap-7">
                {NavbarItem.map((item: NavbarItems) => (
                    <li key={item.id}>
                        <Link to={item.path} className="flex items-center gap-3 text-sm font-medium">
                            {item.icon === "package" ? (
                                <Package className="h-6 w-6" />
                            ) : item.icon === "layoutgrid" ? (
                                <LayoutGrid className="h-6 w-6" />
                            ) : item.icon === "settings" ? (
                                <Settings className="h-6 w-6" />
                            ) : (
                                item.name
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    )
}

export default Sidebar
