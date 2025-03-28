"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig } from "./config/navigationConfig";

export default function ContactLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Контакты
        </h1>
        <nav className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex space-x-8">
            {navigationConfig.map((link) => {
              const isActive =
                (link.href === "/contact" && pathname === "/contact") ||
                (link.href !== "/contact" && pathname.startsWith(link.href));

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`inline-flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-yellow-500 text-yellow-500"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    {link.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {children}
      </div>
    </div>
  );
}
