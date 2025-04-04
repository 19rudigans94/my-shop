"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import VideoPlayer from "@/app/components/VideoPlayer";
import AddToCartButton from "@/app/components/AddToCartButton";

export default function ConsoleDetailsPage() {
  const params = useParams();
  const [console, setConsole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchConsole = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!params.slug) {
          throw new Error("Не указан slug консоли");
        }

        const response = await fetch(`/api/consoles/${params.slug}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.error || "Ошибка загрузки консоли");
        }

        if (!data.console) {
          throw new Error("Консоль не найдена");
        }

        setConsole(data.console);
      } catch (err) {
        console.error("Ошибка при загрузке консоли:", err);
        setError(err?.message || "Произошла ошибка при загрузке консоли");
      } finally {
        setLoading(false);
      }
    };

    fetchConsole();
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

  if (!console) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Консоль не найдена</div>
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
            src={console.image}
            alt={console.title}
            placeholder="blur"
            blurDataURL={console.image}
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
              {console.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-800/80 text-white rounded-full text-sm">
                {console.state ? "Новый" : "Б/у"}
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
                {console.description}
              </p>
            </div>

            {/* Характеристики */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Состояние
                  </h3>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                    {console.state ? "Новый" : "Б/у"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Артикул
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">
                    {console._id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка с видео и ценами */}
          <div className="lg:col-span-1 space-y-8">
            {/* Видео */}
            <VideoPlayer
              url={console.youtubeUrl}
              title={`${console.title} - обзор`}
            />

            {/* Цены */}
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Цена
                </h2>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {console.price.toLocaleString()} ₸
                </div>
                {mounted && (
                  <AddToCartButton item={console} className="w-full mt-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
