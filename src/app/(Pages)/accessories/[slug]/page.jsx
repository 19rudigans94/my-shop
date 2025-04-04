"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import VideoPlayer from "@/app/components/VideoPlayer";
import AddToCartButton from "@/app/components/AddToCartButton";

export default function AccessoryDetailsPage() {
  const params = useParams();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAccessory = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!params.slug) {
          throw new Error("Не указан slug аксессуара");
        }

        const response = await fetch(`/api/accessories/${params.slug}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.error || "Ошибка загрузки аксессуара");
        }

        if (!data.accessory) {
          throw new Error("Аксессуар не найден");
        }

        setAccessory(data.accessory);
      } catch (err) {
        console.error("Ошибка при загрузке аксессуара:", err);
        setError(err?.message || "Произошла ошибка при загрузке аксессуара");
      } finally {
        setLoading(false);
      }
    };

    fetchAccessory();
  }, [params.slug]);

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

  if (!accessory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Аксессуар не найден</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      suppressHydrationWarning
    >
      {/* Верхний баннер с изображением */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={accessory.image}
            alt={accessory.title}
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
              {accessory.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-800/80 text-white rounded-full text-sm">
                {accessory.platform}
              </span>
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
                {accessory.description}
              </p>
            </div>

            {/* Характеристики */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
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
                    Артикул
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">
                    {accessory._id}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Наличие
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">
                    {accessory.stock > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        В наличии ({accessory.stock} шт.)
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Нет в наличии
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка с видео и ценами */}
          <div className="lg:col-span-1 space-y-8">
            {/* Видео */}
            <VideoPlayer
              url={accessory.youtubeUrl}
              title={`${accessory.title} - обзор`}
            />

            {/* Цены */}
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
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
