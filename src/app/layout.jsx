import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/app/components/Header/Header";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
});

export const metadataBase = new URL("https://goldgames.kz");

export const metadata = {
  title: "GoldGames — магазин игр, консолей и аксессуаров",
  description:
    "GoldGames — каталог видеоигр, игровых консолей и аксессуаров с доставкой по Казахстану.",
  keywords: [
    "игры",
    "консоли",
    "аксессуары",
    "игровой магазин",
    "GoldGames",
    "купить игру",
  ],
  openGraph: {
    title: "GoldGames — магазин игр и консолей",
    description:
      "Лучшие видеоигры, игровые консоли и аксессуары в интернет-магазине GoldGames.",
    url: "/",
    siteName: "GoldGames",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "https://goldgames.kz/images/og-image.png",
        alt: "GoldGames — магазин игр и консолей",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoldGames — магазин игр и консолей",
    description:
      "Лучшие видеоигры, игровые консоли и аксессуары в интернет-магазине GoldGames.",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
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
