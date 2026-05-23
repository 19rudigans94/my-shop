"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/widgets/header/ui/header";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 pt-8 pb-24 lg:pb-8">
        {children}
      </main>
    </>
  );
}
