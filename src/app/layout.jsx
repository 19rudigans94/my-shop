import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import ConditionalLayout from "./conditional-layout";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
});

export const metadata = {
  title: "GoldGames",
  description: "Магазин игр и консолей",
};

export const viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${jetBrainsMono.className} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <ConditionalLayout>{children}</ConditionalLayout>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
