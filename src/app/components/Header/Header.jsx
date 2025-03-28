"use client";

import React from "react";
import { navigationConfig } from "./config/navigationConfig";
import Logo from "./components/Logo";
import IconButtons from "./components/IconButtons/index";
import { MobileNavigation } from "./components/Navigation/Mobile";
import { DesktopNavigation } from "./components/Navigation/Desktop";

export const Header = () => {
  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-yellow-500/20 dark:shadow-yellow-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo />
              <DesktopNavigation items={navigationConfig} />
            </div>
            <IconButtons />
          </div>
        </div>
      </header>

      <MobileNavigation items={navigationConfig} />
    </>
  );
};

export default Header;
