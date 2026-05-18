"use client";

import { Package } from "lucide-react";
import { AddToCartButton } from "@/features/add-to-cart";

export default function ProductPriceCard({ item, price, inStock, cardTitle = "Купить", className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{cardTitle}</h2>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          inStock
            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          <Package className="w-3 h-3" />
          {inStock ? "В наличии" : "Нет в наличии"}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {Number(price).toLocaleString("ru-RU")} ₸
      </div>
      <AddToCartButton item={item} className="w-full" />
    </div>
  );
}
