import { describe, it, expect, beforeEach } from "vitest";
import useCartStore from "./store";

const game = { _id: "g1", title: "Elden Ring", price: 15000, platform: "PS5" };
const cart = () => useCartStore.getState();

beforeEach(() => {
  cart().clearCart();
});

describe("корзина", () => {
  it("считает итоговую сумму и количество", () => {
    cart().addItem(game);
    cart().addItem(game);
    cart().addItem({ _id: "c1", title: "PS5", price: "250000", type: "console" });

    expect(cart().getTotalItems()).toBe(3);
    expect(cart().getTotalPrice()).toBe(15000 * 2 + 250000);
  });

  it("разные состояние/вариант одной игры — разные позиции", () => {
    cart().addItem(game);
    cart().addItem({ ...game, condition: "used" });
    cart().addItem({ ...game, variant: "digital" });

    expect(cart().items).toHaveLength(3);
    expect(cart().items.map((i) => [i.condition, i.variant])).toEqual([
      ["new", "physical"],
      ["used", "physical"],
      ["new", "digital"],
    ]);
  });

  it("некорректная цена превращается в 0, а не в NaN", () => {
    cart().addItem({ _id: "x", price: "abc" });

    expect(cart().getTotalPrice()).toBe(0);
  });

  it("updateQuantity меняет только нужную позицию, 0 удаляет её", () => {
    cart().addItem(game);
    cart().addItem({ ...game, condition: "used" });

    cart().updateQuantity("g1", 4, "used", "physical");
    expect(cart().items.find((i) => i.condition === "used").quantity).toBe(4);
    expect(cart().items.find((i) => i.condition === "new").quantity).toBe(1);

    cart().updateQuantity("g1", 0, "new", "physical");
    expect(cart().items).toHaveLength(1);
    expect(cart().getTotalPrice()).toBe(15000 * 4);
  });

  it("отрицательное количество удаляет позицию", () => {
    cart().addItem(game);
    cart().updateQuantity("g1", -3, "new", "physical");

    expect(cart().items).toEqual([]);
  });

  it("removeItem удаляет позицию по id + состоянию + варианту", () => {
    cart().addItem(game);
    cart().addItem({ ...game, variant: "digital" });

    cart().removeItem("g1", "new", "digital");

    expect(cart().items).toHaveLength(1);
    expect(cart().items[0].variant).toBe("physical");
  });
});
