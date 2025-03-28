"use client";

import React from "react";

const CartSummary = ({ items }) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const delivery = 0; // Бесплатная доставка
  const total = subtotal + delivery;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Сумма заказа
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Товары</span>
          <span className="text-gray-900 dark:text-white">
            {new Intl.NumberFormat("ru-RU", {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(subtotal)}{" "}
            ₸
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Доставка</span>
          <span className="text-green-600 dark:text-green-400">Бесплатно</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              Итого
            </span>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {new Intl.NumberFormat("ru-RU", {
                style: "decimal",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(total)}{" "}
              ₸
            </span>
          </div>
        </div>
      </div>
      <button className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors">
        Оформить заказ
      </button>
      <a
        href="/games"
        className="block w-full mt-4 text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        Продолжить покупки
      </a>
    </div>
  );
};

export default CartSummary;
