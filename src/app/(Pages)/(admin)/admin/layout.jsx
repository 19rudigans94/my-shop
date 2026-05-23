"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Gamepad2,
  Key,
  Package,
  Monitor,
  ShoppingBag,
  ArrowLeft,
  Menu,
  LogOut,
} from "lucide-react";
import { ToastProvider } from "@/shared/ui/toast";

const navigation = [
  { name: "Панель", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Игры", href: "/admin/games", icon: Gamepad2 },
  { name: "Ключи и Диски", href: "/admin/keys", icon: Key },
  { name: "Аксессуары", href: "/admin/accessories", icon: Package },
  { name: "Консоли", href: "/admin/consoles", icon: Monitor },
  { name: "Заказы", href: "/admin/orders", icon: ShoppingBag },
];

function NavItem({ item, pathname, onClick }) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-yellow-500 text-gray-900"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {item.name}
    </Link>
  );
}

function Sidebar({ pathname, onNavigate }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Логотип */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">GoldGames</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
        ))}
      </nav>

      {/* Нижние кнопки */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0" />
          На сайт
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Выйти
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Мобильный overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            pathname={pathname}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>

        {/* Основной контент */}
        <div className="flex-1 lg:ml-60 min-w-0">
          {/* Мобильная шапка */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                <Gamepad2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">GoldGames Admin</span>
            </div>
          </div>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
