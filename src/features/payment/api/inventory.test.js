import { describe, it, expect, vi, beforeEach } from "vitest";

// Все обращения к БД замоканы: тесты проверяют логику списания, а не Mongo.
vi.mock("@/shared/lib/db/mongodb", () => ({ default: vi.fn().mockResolvedValue({}) }));
vi.mock("@/entities/console/model/schema", () => ({
  default: { findOneAndUpdate: vi.fn() },
}));
vi.mock("@/entities/accessory/model/schema", () => ({
  default: { findOneAndUpdate: vi.fn() },
}));
vi.mock("@/entities/game/model/physical-disk-schema", () => ({
  default: { findOneAndUpdate: vi.fn() },
}));
vi.mock("@/entities/game/model/digital-copy-schema", () => ({
  default: { findById: vi.fn() },
}));
vi.mock("@/shared/lib/crypto", () => ({
  decryptCredential: vi.fn((v) => `dec(${v})`),
}));

import connectDB from "@/shared/lib/db/mongodb";
import Console from "@/entities/console/model/schema";
import Accessory from "@/entities/accessory/model/schema";
import PhysicalDisk from "@/entities/game/model/physical-disk-schema";
import DigitalCopy from "@/entities/game/model/digital-copy-schema";
import { updateInventoryAfterPurchase } from "./inventory";

function makeDigitalCopy(credentials) {
  return {
    credentials: credentials.map((c) => ({ ...c })),
    updatedAt: null,
    save: vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("updateInventoryAfterPurchase: консоли и аксессуары", () => {
  it("списывает консоль атомарно, только если остатка хватает", async () => {
    Console.findOneAndUpdate.mockResolvedValue({ title: "PS5", stock: 3 });

    const res = await updateInventoryAfterPurchase([
      { id: "c1", type: "console", quantity: 2 },
    ]);

    expect(res).toEqual({ allSuccessful: true, digitalCredentials: [] });
    expect(connectDB).toHaveBeenCalled();
    const [filter, update, opts] = Console.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: "c1", stock: { $gte: 2 } });
    expect(update.$inc).toEqual({ stock: -2 });
    expect(update.$set.updatedAt).toBeInstanceOf(Date);
    expect(opts).toEqual({ new: true });
  });

  it("возвращает неуспех, если консоли не хватает на складе", async () => {
    Console.findOneAndUpdate.mockResolvedValue(null);

    const res = await updateInventoryAfterPurchase([
      { id: "c1", type: "console", quantity: 5 },
    ]);

    expect(res.allSuccessful).toBe(false);
  });

  it("списывает аксессуар с проверкой остатка", async () => {
    Accessory.findOneAndUpdate.mockResolvedValue({ title: "DualSense", stock: 0 });

    const res = await updateInventoryAfterPurchase([
      { id: "a1", type: "accessory", quantity: 1 },
    ]);

    expect(res.allSuccessful).toBe(true);
    expect(Accessory.findOneAndUpdate.mock.calls[0][0]).toEqual({
      _id: "a1",
      stock: { $gte: 1 },
    });
    expect(Console.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("ошибка БД по одной позиции не роняет функцию, а даёт allSuccessful=false", async () => {
    Accessory.findOneAndUpdate.mockRejectedValue(new Error("db down"));

    const res = await updateInventoryAfterPurchase([
      { id: "a1", type: "accessory", quantity: 1 },
    ]);

    expect(res).toEqual({ allSuccessful: false, digitalCredentials: [] });
  });
});

describe("updateInventoryAfterPurchase: физические диски", () => {
  it.each([
    ["корзина: type=game, variant=physical", { type: "game", variant: "physical" }],
    ["корзина: type=game без variant", { type: "game" }],
    ["заказ из БД: type=physical", { type: "physical" }],
  ])("%s → списывает нужный вариант диска", async (_label, extra) => {
    PhysicalDisk.findOneAndUpdate.mockResolvedValue({ _id: "pd" });

    const res = await updateInventoryAfterPurchase([
      { id: "g1", platform: "PS5", condition: "used", quantity: 1, ...extra },
    ]);

    expect(res.allSuccessful).toBe(true);
    const [filter, update] = PhysicalDisk.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({
      gameId: "g1",
      platform: "PS5",
      variants: { $elemMatch: { condition: "used", stock: { $gte: 1 } } },
    });
    expect(update.$inc).toEqual({ "variants.$.stock": -1 });
    expect(DigitalCopy.findById).not.toHaveBeenCalled();
  });

  it("неуспех, если нужного состояния/остатка нет", async () => {
    PhysicalDisk.findOneAndUpdate.mockResolvedValue(null);

    const res = await updateInventoryAfterPurchase([
      { id: "g1", type: "physical", platform: "PS5", condition: "new", quantity: 2 },
    ]);

    expect(res.allSuccessful).toBe(false);
  });
});

describe("updateInventoryAfterPurchase: цифровые копии", () => {
  it.each([
    ["корзина: type=game, variant=digital", { type: "game", variant: "digital" }],
    ["заказ из БД: type=digital", { type: "digital" }],
  ])("%s → выдаёт только активные аккаунты и деактивирует их", async (_label, extra) => {
    const copy = makeDigitalCopy([
      { login: "l0", password: "p0", isActive: false },
      { login: "l1", password: "p1", isActive: true },
      { login: "l2", password: "p2", isActive: true },
      { login: "l3", password: "p3", isActive: true },
    ]);
    DigitalCopy.findById.mockResolvedValue(copy);

    const res = await updateInventoryAfterPurchase([
      { id: "dc1", title: "Elden Ring", platform: "PS5", quantity: 2, ...extra },
    ]);

    expect(DigitalCopy.findById).toHaveBeenCalledWith("dc1");
    expect(res.allSuccessful).toBe(true);
    expect(res.digitalCredentials).toEqual([
      {
        name: "Elden Ring",
        platform: "PS5",
        credentials: [
          { login: "dec(l1)", password: "dec(p1)" },
          { login: "dec(l2)", password: "dec(p2)" },
        ],
      },
    ]);
    expect(copy.credentials.map((c) => c.isActive)).toEqual([false, false, false, true]);
    expect(copy.save).toHaveBeenCalledOnce();
    expect(PhysicalDisk.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("не трогает аккаунты и не сохраняет, если активных меньше, чем куплено", async () => {
    const copy = makeDigitalCopy([
      { login: "l1", password: "p1", isActive: true },
      { login: "l2", password: "p2", isActive: false },
    ]);
    DigitalCopy.findById.mockResolvedValue(copy);

    const res = await updateInventoryAfterPurchase([
      { id: "dc1", type: "digital", quantity: 2 },
    ]);

    expect(res).toEqual({ allSuccessful: false, digitalCredentials: [] });
    expect(copy.credentials[0].isActive).toBe(true);
    expect(copy.save).not.toHaveBeenCalled();
  });

  it("неуспех, если цифровая копия не найдена", async () => {
    DigitalCopy.findById.mockResolvedValue(null);

    const res = await updateInventoryAfterPurchase([
      { id: "missing", type: "digital", quantity: 1 },
    ]);

    expect(res).toEqual({ allSuccessful: false, digitalCredentials: [] });
  });

  it("подставляет название по умолчанию, если у позиции нет title/name", async () => {
    DigitalCopy.findById.mockResolvedValue(
      makeDigitalCopy([{ login: "l", password: "p", isActive: true }])
    );

    const res = await updateInventoryAfterPurchase([
      { id: "dc1", type: "digital", quantity: 1 },
    ]);

    expect(res.digitalCredentials[0].name).toBe("Игра");
  });
});

describe("updateInventoryAfterPurchase: смешанные заказы", () => {
  it("успех только если все позиции списались", async () => {
    Console.findOneAndUpdate.mockResolvedValue({ title: "PS5", stock: 1 });
    PhysicalDisk.findOneAndUpdate.mockResolvedValue(null);

    const res = await updateInventoryAfterPurchase([
      { id: "c1", type: "console", quantity: 1 },
      { id: "g1", type: "physical", platform: "PS5", condition: "new", quantity: 1 },
    ]);

    expect(res.allSuccessful).toBe(false);
    expect(Console.findOneAndUpdate).toHaveBeenCalledOnce();
    expect(PhysicalDisk.findOneAndUpdate).toHaveBeenCalledOnce();
  });

  it("неизвестный тип товара считается неуспехом", async () => {
    const res = await updateInventoryAfterPurchase([
      { id: "x", type: "gift-card", quantity: 1 },
    ]);

    expect(res.allSuccessful).toBe(false);
  });

  it("если БД недоступна, возвращает неуспех без исключения", async () => {
    connectDB.mockRejectedValueOnce(new Error("no MONGODB_URI"));

    const res = await updateInventoryAfterPurchase([
      { id: "c1", type: "console", quantity: 1 },
    ]);

    expect(res).toEqual({ allSuccessful: false, digitalCredentials: [] });
    expect(Console.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
