"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import PriceList from "./components/priceList";
// import { useCartStore } from "@/app/store/useCartStore";

export default function GameDetailsPage() {
  const params = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!params.slug) {
          throw new Error("Не указан slug игры");
        }

        const response = await fetch(`/api/games/${params.slug}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.error || "Ошибка загрузки игры");
        }

        if (!data.game) {
          throw new Error("Игра не найдена");
        }

        setGame(data.game);
      } catch (err) {
        console.error("Ошибка при загрузке игры:", err);
        setError(err?.message || "Произошла ошибка при загрузке игры");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params.slug]);

  const handleAddToCart = () => {
    // if (game) {
    //   addToCart({
    //     id: game._id,
    //     title: game.title,
    //     price: game.price,
    //     image: game.image,
    //     platform: game.platform,
    //     quantity: 1,
    //   });
    // }
    console.log(game);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Игра не найдена</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Верхний баннер с изображением */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={game.image}
            alt={game.title}
            fill
            className="object-cover brightness-50"
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
              {game.platforms.map((platform) => (
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

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка с описанием и характеристиками */}
          <div className="lg:col-span-2 space-y-8">
            {/* Описание */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {game.description}
              </p>
            </div>

            {/* Видео */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Трейлер игры
              </h2>
              <div className="aspect-video w-full relative rounded-xl overflow-hidden">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={game.youtubeUrl}
                  title={`${game.title} - трейлер`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Характеристики */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
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

          {/* Правая колонка с ценами */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Варианты покупки
                </h2>
                <PriceList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
