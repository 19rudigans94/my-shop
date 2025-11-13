import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/app/components/Header/Header";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
});

export const metadata = {
  title: "GoldGames",
  description: "Магазин игр и консолей",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${jetBrainsMono.className} antialiased`}>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
