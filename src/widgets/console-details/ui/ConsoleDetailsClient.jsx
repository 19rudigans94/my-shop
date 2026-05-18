"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { ProductHero } from "@/widgets/product-hero";
import { ImageGallery } from "@/features/image-gallery";
import { ProductPriceCard } from "@/widgets/product-price-card";
import { VideoPlayer } from "@/features/video-player";
import { useProductShare } from "@/features/product-share";

const BREADCRUMBS = [
  { label: "Главная", href: "/" },
  { label: "Консоли", href: "/consoles" },
];

export default function ConsoleDetailsClient({ console: item }) {
  const images = item.images?.length > 0 ? item.images : item.image ? [{ url: item.image }] : [];
  const [selectedImage, setSelectedImage] = useState(images[0] || null);

  const mainImageSrc = selectedImage?.url || selectedImage?.thumbUrl || "/images/placeholder.svg";
  const blurDataURL = selectedImage?.thumbUrl || selectedImage?.url;
  const inStock = item.stock > 0;
  const isNew = item.state;

  const { copied, handleShare } = useProductShare({ title: item.title });

  const badges = (
    <>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${isNew ? "bg-green-500/90 text-white" : "bg-blue-500/90 text-white"}`}>
        {isNew ? "Новый" : "Б/У"}
      </span>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${inStock ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
        {inStock ? `В наличии: ${item.stock} шт.` : "Нет в наличии"}
      </span>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <ProductHero
        title={item.title}
        mainImageSrc={mainImageSrc}
        blurDataURL={blurDataURL || undefined}
        breadcrumbs={[...BREADCRUMBS, { label: item.title }]}
        badges={badges}
        price={item.price}
        onShare={handleShare}
        copied={copied}
      />

      <ImageGallery
        images={images}
        selectedImage={selectedImage}
        onSelect={setSelectedImage}
        title={item.title}
      />

      <div className="container mx-auto px-4 py-8 -mt-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            {item.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Описание</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Характеристики</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Состояние</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${
                    isNew
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}>
                    <Gamepad2 className="w-3.5 h-3.5" />
                    {isNew ? "Новый" : "Б/У"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Наличие</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-sm font-medium ${inStock ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                      {inStock ? `${item.stock} шт. в наличии` : "Нет в наличии"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Артикул</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{item._id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="sticky top-4 space-y-6">
              <ProductPriceCard item={item} price={item.price} inStock={inStock} cardTitle="Купить консоль" />

              {item.youtubeUrl && (
                <VideoPlayer url={item.youtubeUrl} title={`${item.title} — обзор`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
