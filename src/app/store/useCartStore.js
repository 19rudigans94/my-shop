"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Создаем хранилище корзины с использованием Zustand
const useCartStore = create(
  persist(
    (set, get) => ({
      // Состояние корзины
      items: [],

      // Добавление товара в корзину
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item._id);

        if (existingItem) {
          // Если товар уже есть в корзине, увеличиваем количество
          set({
            items: items.map((i) =>
              i.id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          // Если товара нет в корзине, добавляем его
          set({
            items: [
              ...items,
              {
                id: item._id,
                title: item.title,
                price: item.price,
                image: item.image,
                platform: item.platform || item.platforms?.[0] || "Не указана",
                quantity: 1,
                type: item.slug
                  ? "accessory"
                  : item.platforms
                  ? "game"
                  : "console",
                slug: item.slug,
              },
            ],
          });
        }
      },

      // Удаление товара из корзины
      removeItem: (itemId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== itemId),
        });
      },

      // Обновление количества товара
      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          // Если количество 0 или меньше, удаляем товар
          set({
            items: items.filter((item) => item.id !== itemId),
          });
        } else {
          // Иначе обновляем количество
          set({
            items: items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          });
        }
      },

      // Очистка корзины
      clearCart: () => {
        set({ items: [] });
      },

      // Получение общего количества товаров
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // Получение общей стоимости
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage", // Имя для localStorage
      storage: createJSONStorage(() => {
        // Проверяем, что мы на клиенте, перед использованием localStorage
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        // Возвращаем заглушку для сервера
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

export default useCartStore;
