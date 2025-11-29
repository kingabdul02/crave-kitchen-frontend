import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Search,
  BarChart3,
  Settings,
  User,
} from "lucide-react";
import { cn } from "../lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Items", href: "/items", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Search", href: "/search", icon: Search },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
  return (
    <div className={cn("hidden md:flex md:w-64 md:flex-col", className)}>
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-lg p-2">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Crave Kitchen
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex-1 flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  )
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
