"use client";

import { useState, useEffect } from "react";
import useCartStore from "@/app/store/useCartStore";

export default function AddToCartButton({ item, className = "" }) {
  // Хуки должны вызываться в начале компонента, не в условных блоках
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Обновляем состояние только на клиенте после монтирования
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    if (!item) return;

    setIsAdding(true);
    addItem(item);

    // Анимация добавления в корзину
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || !mounted || !item}
      className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
      ) : (
        "Добавить в корзину"
      )}
    </button>
  );
}
