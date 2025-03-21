"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DesktopNavigation({ items }) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="relative group">
            <span
              className={`text-sm font-medium transition-colors ${
                isActive
                  ? "text-yellow-500 dark:text-yellow-400"
                  : "text-gray-700 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
