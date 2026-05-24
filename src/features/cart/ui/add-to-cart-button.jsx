"use client";

import { useState, useEffect } from "react";
import useCartStore from "@/features/cart/model/store";

export default function AddToCartButton({ item, type, className = "" }) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const outOfStock = mounted && item && typeof item.stock === "number" && item.stock <= 0;

  const handleAddToCart = () => {
    if (!item || outOfStock) return;

    setIsAdding(true);
    // БАГ A FIX: мержим type проп чтобы консоли/аксессуары не уходили как type:"game"
    addItem(type ? { ...item, type } : item);

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || !mounted || !item || outOfStock}
      className={`px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        outOfStock
          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } ${className}`}
      suppressHydrationWarning
    >
      {isAdding ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Добавление...
        </span>
      ) : outOfStock ? (
        "Нет в наличии"
      ) : (
        "Добавить в корзину"
      )}
    </button>
  );
}
