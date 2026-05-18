"use client";

import Image from "next/image";

export default function ImageGallery({ images = [], selectedImage, onSelect, title = "" }) {
  if (images.length <= 1) return null;

  return (
    <div className="bg-gray-900 px-4 py-3">
      <div className="container mx-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(img)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === img
                  ? "border-amber-400 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.thumbUrl || img.url || "/images/placeholder.svg"}
                alt={`${title} фото ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
