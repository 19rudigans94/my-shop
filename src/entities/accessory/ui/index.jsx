"use client";

import Image from "next/image";

export default function AccessoryCard({ accessory, onClick }) {
  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
        <Image
          src={accessory.image}
          alt={accessory.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="px-2 py-1 text-white text-sm rounded bg-black/50 absolute top-2 left-2">
          {accessory.platform}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold hover:text-yellow-500 transition-colors">
            {accessory.title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {accessory.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">{accessory.price} ₸</span>
        </div>
      </div>
    </div>
  );
}
