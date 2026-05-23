"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-2 overflow-hidden"
      style={{
        height: "calc(100vh - 15rem)",
        maxHeight: "calc(100vh - 15rem)",
        minHeight: "calc(100vh - 15rem)",
      }}
    >
      <div className="max-w-xs w-full">
        {/* Анимированная карточка */}
        <div
          className={`
            bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 text-center 
            border border-gray-200 dark:border-gray-700
            transform transition-all duration-700 ease-out
            ${
              mounted
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-10 opacity-0 scale-95"
            }
          `}
        >
          {/* Анимированная иконка успеха */}
          <div className="relative mb-3">
            <div
              className={`
                w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-green-400 to-green-600 
                flex items-center justify-center shadow-lg shadow-green-500/30
                transform transition-all duration-1000 ease-out delay-300
                ${mounted ? "rotate-0 scale-100" : "rotate-45 scale-0"}
              `}
            >
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Пульсирующие кольца */}
            <div
              className={`
                absolute inset-0 w-14 h-14 mx-auto rounded-full border-4 border-green-400
                animate-ping opacity-20
                ${mounted ? "block" : "hidden"}
              `}
            />
            <div
              className={`
                absolute inset-0 w-14 h-14 mx-auto rounded-full border-2 border-green-300
                animate-pulse opacity-30 delay-75
                ${mounted ? "block" : "hidden"}
              `}
            />
          </div>

          {/* Заголовок */}
          <h1
            className={`
              text-xl font-bold text-gray-900 dark:text-white mb-2
              transform transition-all duration-700 ease-out delay-500
              ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }
            `}
          >
            Отлично!
          </h1>

          {/* Подзаголовок */}
          <p
            className={`
              text-gray-600 dark:text-gray-300 mb-3 text-sm
              transform transition-all duration-700 ease-out delay-700
              ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }
            `}
          >
            Ваш заказ успешно оформлен
          </p>

          {/* Детали заказа */}
          <div
            className={`
              bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-3
              transform transition-all duration-700 ease-out delay-900
              ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }
            `}
          >
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
              <span>Статус заказа:</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                Подтвержден
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Время обработки:</span>
              <span className="font-semibold">5-15 минут</span>
            </div>
          </div>

          {/* Кнопка действия */}
          <div
            className={`
              transform transition-all duration-700 ease-out delay-1100
              ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }
            `}
          >
            <Link
              href="/"
              className="
                block w-full 
                hover:from-yellow-500 hover:to-yellow-600
                text-white font-semibold py-2 px-4 rounded-lg text-sm
                transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                shadow-yellow-500/30 hover:shadow-yellow-500/50
                focus:outline-none focus:ring-4 focus:ring-yellow-500/50
              "
            >
              Вернуться в магазин
            </Link>
          </div>

          {/* Компактная дополнительная информация */}
          <div
            className={`
              mt-3 text-center text-xs text-gray-500 dark:text-gray-400
              transform transition-all duration-700 ease-out delay-1300
              ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2 text-xs">
              <span>📧 Email отправлен</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Безопасно
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
