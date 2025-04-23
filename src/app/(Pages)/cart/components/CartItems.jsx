"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import useCartStore from "@/app/store/useCartStore";

export default function CartItems() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Обновляем состояние только на клиенте после монтирования
  useEffect(() => {
    setMounted(true);
    setCartItems(items);
  }, [items]);

  // Обработчик изменения количества
  const handleQuantityChange = (itemId, newQuantity, condition, variant) => {
    setIsUpdating(true);
    updateQuantity(itemId, newQuantity, condition, variant);
    setTimeout(() => setIsUpdating(false), 300);
  };

  // Обработчик удаления товара
  const handleRemoveItem = (itemId, condition, variant) => {
    removeItem(itemId, condition, variant);
  };

  // Получение ссылки на страницу товара
  const getItemLink = (item) => {
    switch (item.type) {
      case "game":
        return `/games/${item.slug}`;
      case "console":
        return `/consoles/${item.slug}`;
      case "accessory":
        return `/accessories/${item.slug}`;
      default:
        return "#";
    }
  };

  // Получение отображаемого состояния товара
  const getConditionLabel = (condition) => {
    switch (condition) {
      case "new":
        return "Новый";
      case "used":
        return "Б/У";
      default:
        return "";
    }
  };

  // Создание уникального ключа для товара
  const getItemKey = (item) => {
    return `${item.id}_${item.condition || "new"}_${
      item.variant || "physical"
    }`;
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      suppressHydrationWarning
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Товары в корзине
        </h2>
        {!mounted ? (
          <p className="text-gray-500 dark:text-gray-400">
            Загрузка корзины...
          </p>
        ) : cartItems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Ваша корзина пуста</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={getItemKey(item)}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <Link href={getItemLink(item)} className="flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-grow">
                  <Link
                    href={getItemLink(item)}
                    className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {item.title}
                  </Link>

                  <div className="flex flex-wrap gap-2 mt-1 mb-1">
                    {item.platform && (
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-800 dark:text-gray-200">
                        {item.platform}
                      </span>
                    )}
                    {item.condition && (
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          item.condition === "new"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {getConditionLabel(item.condition)}
                      </span>
                    )}
                    {item.variant === "digital" && (
                      <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-xs rounded-full text-amber-800 dark:text-amber-400">
                        Цифровая копия
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {item.price.toLocaleString()} ₸
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        item.quantity - 1,
                        item.condition,
                        item.variant
                      )
                    }
                    disabled={isUpdating || item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        item.quantity + 1,
                        item.condition,
                        item.variant
                      )
                    }
                    disabled={isUpdating}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() =>
                    handleRemoveItem(item.id, item.condition, item.variant)
                  }
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
