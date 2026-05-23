"use client";

import ProductHero from "@/shared/ui/product-hero";
import Breadcrumbs from "@/shared/ui/breadcrumbs";
import VideoPlayer from "@/shared/ui/video-player";

export default function ProductDetailsLayout({
  item,
  breadcrumbs,
  badges,
  specs,
  videoTitle,
  purchaseSection,
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <ProductHero images={item.images || []} title={item.title} badges={badges} />

      <Breadcrumbs items={breadcrumbs} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Описание
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Характеристики
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specs.map(({ label, content }) => (
                  <div key={label}>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {label}
                    </h3>
                    {content}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {videoTitle}
              </h2>
              <VideoPlayer url={item.youtubeUrl} title={`${item.title} — ${videoTitle.toLowerCase()}`} />
            </div>

            {purchaseSection}
          </div>
        </div>
      </div>
    </div>
  );
}
