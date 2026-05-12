"use client";

import Image from "next/image";
import VideoPlayer from "@/app/components/VideoPlayer";
import AddToCartButton from "@/app/components/AddToCartButton";

export default function ConsoleDetailsClient({ console: item }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={
              item.images?.[0]?.url ||
              item.images?.[0]?.thumbUrl ||
              item.image ||
              "/images/placeholder.svg"
            }
            alt={item.title}
            placeholder="blur"
            blurDataURL={
              item.images?.[0]?.thumbUrl ||
              item.images?.[0]?.url ||
              item.image ||
              "/images/placeholder.svg"
            }
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
              {item.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-800/80 text-white rounded-full text-sm">
                {item.state ? "Новый" : "Б/у"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Состояние
                  </h3>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                    {item.state ? "Новый" : "Б/у"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Артикул
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">{item._id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <VideoPlayer
              url={item.youtubeUrl}
              title={`${item.title} - обзор`}
            />

            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Цена
                </h2>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Number(item.price).toLocaleString()} ₸
                </div>
                <AddToCartButton item={item} className="w-full mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
