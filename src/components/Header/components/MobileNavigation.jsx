"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

export default function MobileNavigation({ items, className }) {
  const pathname = usePathname();

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-sm",
        className
      )}
    >
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-2 group"
            >
              <div
                className={`transition-colors ${
                  isActive
                    ? "text-yellow-500 dark:text-yellow-400"
                    : "text-zinc-500 dark:text-zinc-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive
                    ? "text-yellow-500 dark:text-yellow-400"
                    : "text-zinc-500 dark:text-zinc-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400"
                }`}
              >
                {item.text}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
