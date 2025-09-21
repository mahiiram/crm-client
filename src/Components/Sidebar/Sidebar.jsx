// components/Sidebar.jsx

import { Users, Building, Briefcase, ShoppingCart, Package, Settings, User, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const sidebarItems = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Companies", path: "/companies", icon: <Building size={20} /> },
  { label: "Contacts", path: "/contacts", icon: <Users size={20} /> },
  { label: "Opportunities", path: "/opportunities", icon: <Briefcase size={20} /> },
  { label: "Products", path: "/products", icon: <Package size={20} /> },
];

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);

  return (
    //bg-white shadow-md border-r border-gray-200
    //min-h-screen bg-gradient-to-r from-green-300 to-blue-400
    <div className="h-screen w-56 bg-white shadow-md border-r border-gray-200 fixed top-0 left-0">
      <div className="flex flex-col justify-between h-full">
        {/* MyCRM Brand Link */}
        <nav className="py-4">
          <div className="px-4 py-6">
            <NavLink to="/dashboard" className="text-2xl font-bold text-green-700 hover:text-green-600">
              MyCRM
            </NavLink>
          </div>
          {sidebarItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 hover:bg-gray-100 transition ${
                  isActive ? "bg-gray-200 font-semibold" : ""
                }`
              }
            >
              <span className="text-gray-700">{item.icon}</span>
              <span className="text-gray-800 text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200">
          <User size={20} className="text-gray-500" />
          <div className="text-sm text-gray-700 truncate w-32">{user?.email || "user@example.com"}</div>
        </div>
      </div>
    </div>
  );
}
