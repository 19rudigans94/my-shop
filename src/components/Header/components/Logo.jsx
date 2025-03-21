import { Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <div className="flex-shrink-0">
      <Link
        href="/games"
        className="text-xl font-bold flex items-center gap-2 group"
      >
        <Gamepad2
          size={50}
          className="text-yellow-500 dark:text-yellow-400 transform transition-transform group-hover:rotate-12"
        />
        <span className="hidden sm:block font-bold text-gray-900 dark:text-white">
          GoldGames
        </span>
      </Link>
    </div>
  );
}
