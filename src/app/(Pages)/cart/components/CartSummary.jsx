"use client";

import { useState, useEffect } from "react";
import useCartStore from "@/app/store/useCartStore";

export default function CartSummary() {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Обновляем состояние только на клиенте после монтирования
  useEffect(() => {
    setMounted(true);
    setTotalItems(getTotalItems());
    setTotalPrice(getTotalPrice());
  }, [getTotalItems, getTotalPrice, items]);

  // Обработчик оформления заказа
  const handleCheckout = () => {
    setIsProcessing(true);
    // Здесь будет логика оформления заказа
    setTimeout(() => {
      setIsProcessing(false);
      alert("Заказ успешно оформлен!");
      clearCart();
    }, 1500);
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return price.toLocaleString("ru-RU", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      suppressHydrationWarning
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Итого
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Товары ({mounted ? totalItems : 0})
            </span>
            <span className="text-gray-900 dark:text-white">
              {mounted ? formatPrice(totalPrice) : "0"} ₸
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Доставка</span>
            <span className="text-gray-900 dark:text-white">Бесплатно</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Итого к оплате
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {mounted ? formatPrice(totalPrice) : "0"} ₸
              </span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isProcessing || !mounted || totalItems === 0}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Оформление..." : "Оформить заказ"}
          </button>
          {mounted && totalItems > 0 && (
            <button
              onClick={clearCart}
              className="w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Очистить корзину
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
