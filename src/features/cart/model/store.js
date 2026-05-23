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
        try {
          if (!item || typeof item !== "object") {
            throw new Error("Неверный формат товара");
          }

          const { items } = get();
          // Ищем элемент с учетом состояния (новый/б/у)
          const existingItem = items.find(
            (i) =>
              i.id === item._id &&
              i.condition === (item.condition || "new") &&
              i.variant === (item.variant || "physical")
          );

          if (existingItem) {
            // Если товар уже есть в корзине, увеличиваем количество
            set({
              items: items.map((i) =>
                i.id === item._id &&
                i.condition === (item.condition || "new") &&
                i.variant === (item.variant || "physical")
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            });
          } else {
            // Если товара нет в корзине, добавляем его
            const newItem = {
              id: item._id,
              title: item.title || "Без названия",
              price: Number(item.price) || 0,
              image: item.image || "/images/placeholder.svg",
              platform: item.platform || "Не указана",
              quantity: 1,
              type: item.type || "game",
              variant: item.variant || "physical",
              condition: item.condition || "new",
            };

            set({
              items: [...items, newItem],
            });
          }
        } catch (error) {
          console.error("Ошибка при добавлении товара в корзину:", error);
        }
      },

      // Удаление товара из корзины
      removeItem: (itemId, condition, variant) => {
        try {
          const { items } = get();
          set({
            items: items.filter(
              (item) =>
                !(
                  item.id === itemId &&
                  item.condition === condition &&
                  item.variant === variant
                )
            ),
          });
        } catch (error) {
          console.error("Ошибка при удалении товара из корзины:", error);
        }
      },

      // Обновление количества товара
      updateQuantity: (itemId, quantity, condition, variant) => {
        try {
          const { items } = get();
          const newQuantity = Math.max(0, Number(quantity) || 0);

          if (newQuantity <= 0) {
            // Если количество 0 или меньше, удаляем товар
            set({
              items: items.filter(
                (item) =>
                  !(
                    item.id === itemId &&
                    item.condition === condition &&
                    item.variant === variant
                  )
              ),
            });
          } else {
            // Иначе обновляем количество
            set({
              items: items.map((item) =>
                item.id === itemId &&
                item.condition === condition &&
                item.variant === variant
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            });
          }
        } catch (error) {
          console.error("Ошибка при обновлении количества товара:", error);
        }
      },

      // Очистка корзины
      clearCart: () => {
        try {
          set({ items: [] });
        } catch (error) {
          console.error("Ошибка при очистке корзины:", error);
        }
      },

      // Получение общего количества товаров
      getTotalItems: () => {
        try {
          const { items } = get();
          return items.reduce((total, item) => total + (item.quantity || 0), 0);
        } catch (error) {
          console.error(
            "Ошибка при подсчете общего количества товаров:",
            error
          );
          return 0;
        }
      },

      // Получение общей стоимости
      getTotalPrice: () => {
        try {
          const { items } = get();
          return items.reduce(
            (total, item) => total + (item.price || 0) * (item.quantity || 0),
            0
          );
        } catch (error) {
          console.error("Ошибка при подсчете общей стоимости:", error);
          return 0;
        }
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
      onRehydrateStorage: () => (state) => {
        // Проверка и валидация данных после восстановления из localStorage
        if (state) {
          try {
            if (!Array.isArray(state.items)) {
              state.items = [];
            }
            // Очистка некорректных данных и добавление изображения по умолчанию
            state.items = state.items
              .filter(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  item.id &&
                  typeof item.quantity === "number" &&
                  item.quantity > 0
              )
              .map((item) => ({
                ...item,
                image: item.image || "/images/placeholder.svg",
                condition: item.condition || "new",
                variant: item.variant || "physical",
              }));
          } catch (error) {
            console.error("Ошибка при восстановлении данных корзины:", error);
            state.items = [];
          }
        }
      },
    }
  )
);

export default useCartStore;
