"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFetchItem } from "@/shared/lib/hooks/use-fetch-item";
import ProductHero from "@/shared/ui/product-hero";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import VideoPlayer from "@/shared/ui/video-player";
import AddToCartButton from "@/features/cart/ui/add-to-cart-button";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ErrorDisplay from "@/shared/ui/error-display";

export default function AccessoryDetailsPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { item: accessory, loading, error } = useFetchItem(
    params.slug ? `/api/accessories/${params.slug}` : null,
    "accessory"
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  if (!accessory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Аксессуар не найден</div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Аксессуары", href: "/accessories" },
    { label: accessory.title },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <ProductHero image={accessory.image} title={accessory.title} badges={[accessory.platform]} />

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
                {accessory.description}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Характеристики
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Платформа
                  </h3>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                    {accessory.platform}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Наличие
                  </h3>
                  {accessory.stock > 0 ? (
                    <span className="text-green-600 dark:text-green-400">
                      В наличии ({accessory.stock} шт.)
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      Нет в наличии
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Артикул
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">{accessory._id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Обзор
              </h2>
              <VideoPlayer url={accessory.youtubeUrl} title={`${accessory.title} — обзор`} />
            </div>

            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Цена
                </h2>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {accessory.price.toLocaleString()} ₸
                </div>
                {mounted && (
                  <AddToCartButton item={accessory} className="w-full mt-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
