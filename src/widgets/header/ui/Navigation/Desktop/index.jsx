"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { styles } from "./styles";

export const DesktopNavigation = ({ items }) => {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center flex-1 mx-8">
      <div className="flex items-center space-x-2">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={styles.link(isActive)}>
              <Icon className={styles.icon(isActive)} />
              <span className={styles.text(isActive)}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
