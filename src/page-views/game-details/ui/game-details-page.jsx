"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFetchItem } from "@/shared/lib/hooks/use-fetch-item";
import ProductHero from "@/shared/ui/product-hero";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import PriceList from "@/widgets/game-price-list/ui/price-list";
import VideoPlayer from "@/shared/ui/video-player";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ErrorDisplay from "@/shared/ui/error-display";

export default function GameDetailsPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { item: game, loading, error } = useFetchItem(
    params.slug ? `/api/games/${params.slug}` : null,
    "game"
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Игра не найдена</div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Игры", href: "/games" },
    { label: game.title },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <ProductHero image={game.image} title={game.title} badges={game.platforms} />

      <Breadcrumbs items={breadcrumbs} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка */}
          <div className="lg:col-span-2 space-y-8">
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
                    {game.platforms.map((platform) => (
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
                    {game.genre.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Артикул
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">{game._id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Трейлер
              </h2>
              <VideoPlayer url={game.youtubeUrl} title={`${game.title} — трейлер`} />
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-lg border border-amber-100 dark:border-amber-900">
              <h2 className="text-2xl font-semibold mb-4 text-amber-700 dark:text-amber-400">
                Варианты покупки
              </h2>
              {mounted && <PriceList />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
