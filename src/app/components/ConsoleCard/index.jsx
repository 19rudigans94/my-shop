"use client";

import Image from "next/image";

export default function ConsoleCard({ console, onClick }) {
  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
        <Image
          src={console.image}
          alt={console.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <p
          className={`absolute px-2 py-1 top-2 left-2 text-white text-sm rounded ${
            console.state ? "bg-green-500/50" : "bg-red-500/50"
          } font-bold`}
        >
          {console.state ? "Новый" : "Б/у"}
        </p>
      </div>
      <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-sm font-medium"></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold hover:text-yellow-500 transition-colors">
            {console.title}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {console.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">{console.price} ₸</span>
        </div>
      </div>
    </div>
  );
}
