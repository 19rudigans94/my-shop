"use client";

import React from "react";
import { navigationConfig } from "./config/navigationConfig";
import Logo from "./components/Logo";
import IconButtons from "./components/IconButtons/index";
import { MobileNavigation } from "./components/Navigation/Mobile";
import { DesktopNavigation } from "./components/Navigation/Desktop";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          <Logo />
          <DesktopNavigation items={navigationConfig} />
          <div className="ml-auto">
            <IconButtons />
          </div>
        </div>
      </div>
      <MobileNavigation items={navigationConfig} className="" />
    </header>
  );
};

export default Header;
