"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        try {
          if (!item || typeof item !== "object") {
            throw new Error("Неверный формат товара");
          }

          const { items } = get();
          const existingItem = items.find(
            (i) =>
              i.id === item._id &&
              i.condition === (item.condition || "new") &&
              i.variant === (item.variant || "physical")
          );

          if (existingItem) {
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
            const newItem = {
              id: item._id,
              title: item.title || "Без названия",
              price: Number(item.price) || 0,
              image:
                item.image ||
                item.images?.[0]?.thumbUrl ||
                item.images?.[0]?.url ||
                "/images/placeholder.svg",
              platform: item.platform || "Не указана",
              quantity: 1,
              type: item.type || "game",
              variant: item.variant || "physical",
              condition: item.condition || "new",
            };

            set({ items: [...items, newItem] });
          }
        } catch (error) {
          console.error("Ошибка при добавлении товара в корзину:", error);
        }
      },

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

      updateQuantity: (itemId, quantity, condition, variant) => {
        try {
          const { items } = get();
          const newQuantity = Math.max(0, Number(quantity) || 0);

          if (newQuantity <= 0) {
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

      clearCart: () => {
        try {
          set({ items: [] });
        } catch (error) {
          console.error("Ошибка при очистке корзины:", error);
        }
      },

      getTotalItems: () => {
        try {
          const { items } = get();
          return items.reduce((total, item) => total + (item.quantity || 0), 0);
        } catch (error) {
          console.error("Ошибка при подсчете общего количества товаров:", error);
          return 0;
        }
      },

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
      name: "cart-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            if (!Array.isArray(state.items)) {
              state.items = [];
            }
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
                image:
                  item.image ||
                  item.images?.[0]?.thumbUrl ||
                  item.images?.[0]?.url ||
                  "/images/placeholder.svg",
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
