"use client";

import { useState } from "react";
import { ShoppingBag, AlertCircle, CheckCircle, X } from "lucide-react";
import useCartStore from "@/app/store/useCartStore";
import { createPayLinkProduct } from "@/app/utils/paylink";

export default function CartSummary() {
  const [notification, setNotification] = useState(null);
  const [isPayLinkLoading, setIsPayLinkLoading] = useState(false);

  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePayLinkCheckout = async () => {
    const totalPrice = getTotalPrice();
    const totalItems = getTotalItems();

    if (totalItems === 0) {
      showNotification("Корзина пуста", "error");
      return;
    }

    const cartItems = useCartStore.getState().items;
    setIsPayLinkLoading(true);

    try {
      const cartData = {
        totalPrice,
        totalItems,
        items: cartItems,
      };

      const result = await createPayLinkProduct(cartData);

      if (result?.pay_url) {
        showNotification("Перенаправление на страницу оплаты...", "success");
        setTimeout(() => {
          window.location.href = result.pay_url;
        }, 1000);
      } else {
        throw new Error("Не удалось получить ссылку для оплаты");
      }
    } catch (error) {
      showNotification(
        error.message ||
          "Произошла ошибка при создании ссылки оплаты. Попробуйте еще раз.",
        "error"
      );
    } finally {
      setIsPayLinkLoading(false);
    }
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Итого
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Товары ({totalItems})</span>
            <span>{totalPrice.toLocaleString()} ₸</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Доставка</span>
            <span>Бесплатно</span>
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
              <span>Итого к оплате</span>
              <span className="text-amber-600 dark:text-amber-400">
                {totalPrice.toLocaleString()} ₸
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePayLinkCheckout}
            disabled={totalItems === 0 || isPayLinkLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
              totalItems === 0 || isPayLinkLoading
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            {isPayLinkLoading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Создание ссылки...
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Быстрая оплата (PayLink)
              </>
            )}
          </button>
        </div>

        {totalItems > 0 && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Нажимая кнопку «Оформить заказ», вы соглашаетесь с условиями
            публичной оферты
          </p>
        )}
      </div>

      {/* Компонент уведомлений */}
      {notification && (
        <div
          className="fixed top-4 right-4 max-w-sm w-full"
          style={{ zIndex: 999999 }}
        >
          <div
            className={`p-4 rounded-lg shadow-xl flex items-center space-x-3 backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-green-50/95 dark:bg-green-900/90 border border-green-200 dark:border-green-800"
                : "bg-red-50/95 dark:bg-red-900/90 border border-red-200 dark:border-red-800"
            }`}
            style={{ zIndex: 999999 }}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p
              className={`text-sm font-medium ${
                notification.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                notification.type === "success"
                  ? "hover:bg-green-600"
                  : "hover:bg-red-600"
              }`}
              style={{ zIndex: 999999 }}
            >
              <X
                className={`w-4 h-4 ${
                  notification.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
