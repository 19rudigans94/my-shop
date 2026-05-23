"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFetchItem } from "@/shared/lib/hooks/use-fetch-item";
import ProductDetailsLayout from "@/shared/ui/product-details-layout";
import PriceList from "@/widgets/game-price-list/ui/price-list";
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

  const specs = [
    {
      label: "Платформы",
      content: (
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
      ),
    },
    {
      label: "Жанры",
      content: (
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
      ),
    },
  ];

  const purchaseSection = (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 shadow-lg border border-amber-100 dark:border-amber-900">
      <h2 className="text-2xl font-semibold mb-4 text-amber-700 dark:text-amber-400">
        Варианты покупки
      </h2>
      {mounted && <PriceList />}
    </div>
  );

  return (
    <ProductDetailsLayout
      item={game}
      breadcrumbs={breadcrumbs}
      badges={game.platforms}
      specs={specs}
      videoTitle="Трейлер"
      purchaseSection={purchaseSection}
    />
  );
}
