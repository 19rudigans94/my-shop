"use client";

import React from "react";
import Image from "next/image";
import { Minus, Plus, X, Trash2 } from "lucide-react";

const CartItems = ({ items }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => (
          <li key={item.id} className="p-6">
            <div className="flex items-center space-x-4">
              <Image
                src={item.image}
                alt={item.title}
                width={80}
                height={80}
                className="rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.platform}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Уменьшить количество"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Увеличить количество"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("ru-RU", {
                      style: "decimal",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item.price)}{" "}
                    ₸
                  </p>
                </div>
                <button
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Удалить из корзины"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CartItems;
