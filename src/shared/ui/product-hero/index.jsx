"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductHero({ images = [], title, badges = [] }) {
  const [selected, setSelected] = useState(0);
  const mainSrc = images[selected] || "/images/placeholder.svg";

  return (
    <div>
      {/* Главное изображение */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={mainSrc}
            alt={title}
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
              {title}
            </h1>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-800/80 text-white rounded-full text-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Миниатюры галереи */}
      {images.length > 1 && (
        <div className="bg-gray-900 px-4 py-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-yellow-500"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt={`${title} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
