import { LayoutGrid, Package, Settings, Tag } from "lucide-react"
import { NavbarItem } from "../../Constants/NavbarItem"
import type { NavbarItems } from "../../Types/Global"
import { NavLink } from "react-router";

const Sidebar = () => {

    return (
        <aside className="bg-[#f9f9fa] overflow-y-auto h-dvh border-r-2 border-gray-200">
            <ul className="flex flex-col p-6 gap-7">
                {NavbarItem.map((item: NavbarItems) => (
                    <li key={item.id}>
                        <NavLink to={item.path} className={({ isActive }) =>
                            `flex items-center gap-3 text-sm font-medium ${isActive ? "text-[#2881ff]" : "text-gray-500"
                            }`
                        }>
                            {item.icon === "package" ? (
                                <Package className="h-6 w-6" />
                            ) : item.icon === "layoutgrid" ? (
                                <LayoutGrid className="h-6 w-6" />
                            ) : item.icon === "discount" ? (
                                <Tag className="h-6 w-6" />
                            ) : item.icon === "settings" ? (
                                <Settings className=" h-6 w-6" />
                            ) : (
                                item.name
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    )
}

export default Sidebar
