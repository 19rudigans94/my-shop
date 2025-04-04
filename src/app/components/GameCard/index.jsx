"use client";

import Image from "next/image";
const blurDataURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

export default function GameCard({ game, onClick }) {
  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
        <Image
          src={game.image}
          alt={game.title}
          placeholder="blur"
          blurDataURL={blurDataURL}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="px-2 py-1 text-white text-sm rounded bg-black/50 absolute top-2 left-2">
          {game.platforms.map((platform) => platform).join(" / ")}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold hover:text-yellow-500 transition-colors">
            {game.title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {game.description}
        </p>
      </div>
    </div>
  );
}
