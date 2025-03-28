"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { styles } from "./styles";

export const DesktopNavigation = ({ items }) => {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  return (
    <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
      <div className="flex items-center space-x-2">
        {items.map(({ href, label, icon: Icon, submenu }) => {
          const isActive = pathname.includes(href);
          const hasSubmenu = submenu && submenu.length > 0;

          return (
            <div key={href} className="relative group">
              <Link
                href={href}
                className={styles.link(isActive)}
                onMouseEnter={() => hasSubmenu && setOpenSubmenu(href)}
                onMouseLeave={() => hasSubmenu && setOpenSubmenu(null)}
              >
                <Icon className={styles.icon(isActive)} />
                <span className={styles.text(isActive)}>{label}</span>
                {hasSubmenu && (
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform ${
                      openSubmenu === href ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Link>

              {hasSubmenu && (
                <div
                  className={`absolute top-full left-0 mt-1 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg min-w-[200px] transition-all transform origin-top ${
                    openSubmenu === href
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  onMouseEnter={() => setOpenSubmenu(href)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  {submenu.map((item) => {
                    const isSubmenuItemActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isSubmenuItemActive
                            ? "text-yellow-500 bg-gray-50 dark:bg-gray-700"
                            : "text-gray-600 hover:text-yellow-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {item.text}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
