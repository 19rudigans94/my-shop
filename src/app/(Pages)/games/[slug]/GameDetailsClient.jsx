"use client";

import Image from "next/image";
import PriceList from "./components/priceList";
import VideoPlayer from "@/app/components/VideoPlayer";
import AddToCartButton from "@/app/components/AddToCartButton";

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes("youtube.com/embed/")) {
    return url;
  }
  let videoId = "";
  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export default function GameDetailsClient({ game }) {
  const embedUrl = getEmbedUrl(game.youtubeUrl);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={
              game.images?.[0]?.url ||
              game.images?.[0]?.thumbUrl ||
              game.image ||
              "/images/placeholder.svg"
            }
            alt={game.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {game.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {(game.platforms || []).map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-gray-800/80 text-white rounded-full text-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Описание
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Характеристики
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Платформы
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(game.platforms || []).map((platform) => (
                      <span
                        key={platform}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Жанры
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(game.genre || []).map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8 order-2 lg:order-2">
            {embedUrl && (
              <VideoPlayer
                url={embedUrl}
                title={`${game.title} - трейлер`}
              />
            )}

            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Цена
                </h2>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Number(game.price).toLocaleString('ru-RU')} ₸
                </div>
                <div className="mt-4">
                  <AddToCartButton item={game} className="w-full" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <PriceList game={game} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
