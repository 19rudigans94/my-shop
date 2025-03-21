import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header/Header";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "GoldGames || ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${jetBrainsMono.variable}`}>
        <Header />
        <main className="mt-16">{children}</main>
      </body>
    </html>
  );
}
