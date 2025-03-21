import linkItems from "./items";
import React from "react";
import Logo from "./components/Logo";
import { IconButtons } from "./components/IconButtons";
import MobileNavigation from "./components/MobileNavigation";
import DesktopNavigation from "./components/DesktopNavigation";

export default function Header() {
  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg shadow-yellow-500/20 dark:shadow-yellow-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <DesktopNavigation items={linkItems} />
            <IconButtons />
          </div>
        </div>
      </header>

      <MobileNavigation items={linkItems} className="block md:hidden" />
    </>
  );
}
