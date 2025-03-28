"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { styles } from "./styles";

export const MobileNavigation = ({ items, className }) => {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 h-16">
          {items.map(({ href, icon: Icon, text }) => {
            const isActive = pathname.includes(href);
            return (
              <Link key={href} href={href} className={styles.link(isActive)}>
                <Icon className={styles.icon(isActive)} />
                <span className={styles.text(isActive)}>{text}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
