"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import useCartStore from "@/app/store/useCartStore";
import BasicModal from "./BasicModal";

export default function CartSummary() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleCheckout = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOrderSuccess = () => {
    // Очистка корзины при успешном оформлении заказа
    clearCart();
    closeModal();
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

        <button
          onClick={handleCheckout}
          disabled={totalItems === 0}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
            totalItems === 0
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Оформить заказ
        </button>

        {totalItems > 0 && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Нажимая кнопку «Оформить заказ», вы соглашаетесь с условиями
            публичной оферты
          </p>
        )}
      </div>

      <BasicModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        total={totalPrice}
        onSuccess={handleOrderSuccess}
      />
    </>
  );
}
