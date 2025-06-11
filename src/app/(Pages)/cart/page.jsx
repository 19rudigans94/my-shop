"use client";

import { useEffect, useState } from "react";
import CartItems from "./components/CartItems";
import CartSummary from "./components/CartSummary";
import useCartStore from "@/app/store/useCartStore";
import Link from "next/link";

export default function CartPage() {
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Устанавливаем метаданные для страницы
  useEffect(() => {
    document.title = "Корзина";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Корзина с выбранными товарами");
    }

    // Обновляем состояние только на клиенте после монтирования
    setMounted(true);
    setCartItems(items);
  }, [items]);

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      suppressHydrationWarning
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Корзина
      </h1>

      {!mounted ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Загрузка корзины...
          </p>
        </div>
      ) : cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-900 dark:text-white mb-4">
            Ваша корзина пуста
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Добавьте товары в корзину, чтобы оформить заказ
          </p>
          <Link
            href="/games"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Перейти к играм
          </Link>
        </div>
      )}
    </div>
  );
}
