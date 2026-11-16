import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/entities/order/api", () => ({
  markOrderAsPaid: vi.fn(),
  getStoredOrderData: vi.fn(),
  markEmailAsSent: vi.fn(),
  markInventoryAsUpdated: vi.fn(),
  getOrderByPaylinkProductId: vi.fn(),
  getOrderById: vi.fn(),
}));
vi.mock("@/shared/lib/email", () => ({
  sendCustomerPaymentConfirmation: vi.fn(),
  sendStoreOrderNotification: vi.fn(),
}));
vi.mock("@/features/payment/api/inventory", () => ({
  updateInventoryAfterPurchase: vi.fn(),
}));

import {
  markOrderAsPaid,
  getStoredOrderData,
  markEmailAsSent,
  markInventoryAsUpdated,
  getOrderByPaylinkProductId,
} from "@/entities/order/api";
import {
  sendCustomerPaymentConfirmation,
  sendStoreOrderNotification,
} from "@/shared/lib/email";
import { updateInventoryAfterPurchase } from "@/features/payment/api/inventory";
import { handlePaymentVerification } from "./verify-payment";

const BASE = "https://goldgames.test";

function callback(params) {
  const qs = new URLSearchParams(params).toString();
  return new Request(`${BASE}/api/paylink/verification?${qs}`);
}

function redirectPath(res) {
  return new URL(res.headers.get("location")).pathname;
}

const memoryOrder = {
  customerInfo: { email: "ivan@example.com" },
  items: [{ id: "dc1", title: "Elden Ring", type: "game", variant: "digital", quantity: 1 }],
  totalPrice: 15000,
  totalItems: 1,
};

function dbOrder(overrides = {}) {
  return {
    orderId: "ORD-1",
    paymentStatus: "pending",
    customerInfo: { email: "ivan@example.com" },
    items: [
      {
        productId: "dc1",
        name: "Elden Ring",
        price: 15000,
        quantity: 1,
        platform: "PS5",
        condition: "new",
        productType: "digital",
      },
    ],
    totalAmount: 15000,
    totalItems: 1,
    ...overrides,
  };
}

const creds = [{ name: "Elden Ring", platform: "PS5", credentials: [{ login: "l", password: "p" }] }];

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  updateInventoryAfterPurchase.mockResolvedValue({ allSuccessful: true, digitalCredentials: creds });
  sendCustomerPaymentConfirmation.mockResolvedValue(true);
  sendStoreOrderNotification.mockResolvedValue(true);
});

describe("handlePaymentVerification: неуспешная оплата", () => {
  it.each(["failed", "canceled", ""])("status=%j → редирект в корзину, ничего не списано", async (status) => {
    const res = await handlePaymentVerification(callback({ status, uid: "pl_1" }));

    expect(res.status).toBe(307);
    expect(redirectPath(res)).toBe("/cart");
    expect(markOrderAsPaid).not.toHaveBeenCalled();
    expect(updateInventoryAfterPurchase).not.toHaveBeenCalled();
    expect(sendCustomerPaymentConfirmation).not.toHaveBeenCalled();
  });
});

describe("handlePaymentVerification: заказ найден в БД", () => {
  beforeEach(() => {
    getStoredOrderData.mockReturnValue(null);
  });

  it("помечает оплаченным, списывает остатки и отправляет письма с аккаунтами", async () => {
    getOrderByPaylinkProductId.mockResolvedValue(dbOrder());

    const res = await handlePaymentVerification(
      callback({ status: "successful", uid: "pl_1", token: "tok" })
    );

    expect(redirectPath(res)).toBe("/success");
    expect(getOrderByPaylinkProductId).toHaveBeenCalledWith("pl_1");
    expect(markOrderAsPaid).toHaveBeenCalledWith("ORD-1", { uid: "pl_1", token: "tok" });

    // Позиции из БД приводятся к формату корзины
    expect(updateInventoryAfterPurchase).toHaveBeenCalledWith([
      {
        id: "dc1",
        title: "Elden Ring",
        price: 15000,
        quantity: 1,
        platform: "PS5",
        condition: "new",
        type: "digital",
      },
    ]);
    expect(markInventoryAsUpdated).toHaveBeenCalled();

    expect(sendCustomerPaymentConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 15000, customerInfo: { email: "ivan@example.com" } }),
      creds
    );
    expect(sendStoreOrderNotification).toHaveBeenCalledOnce();
    expect(markEmailAsSent).toHaveBeenCalledWith("pl_1", "customer");
    expect(markEmailAsSent).toHaveBeenCalledWith("pl_1", "store");
  });

  it("списывает инвентарь раньше, чем отправляет письмо покупателю", async () => {
    getOrderByPaylinkProductId.mockResolvedValue(dbOrder());

    await handlePaymentVerification(callback({ status: "successful", uid: "pl_1" }));

    const inventoryAt = updateInventoryAfterPurchase.mock.invocationCallOrder[0];
    const emailAt = sendCustomerPaymentConfirmation.mock.invocationCallOrder[0];
    expect(inventoryAt).toBeLessThan(emailAt);
  });

  it.each(["successful", "failed"])(
    "повторный callback для заказа со статусом %s игнорируется",
    async (paymentStatus) => {
      getOrderByPaylinkProductId.mockResolvedValue(dbOrder({ paymentStatus }));

      const res = await handlePaymentVerification(callback({ status: "successful", uid: "pl_1" }));

      expect(redirectPath(res)).toBe("/success");
      expect(markOrderAsPaid).not.toHaveBeenCalled();
      expect(updateInventoryAfterPurchase).not.toHaveBeenCalled();
      expect(sendCustomerPaymentConfirmation).not.toHaveBeenCalled();
    }
  );

  it("неизвестный заказ: ничего не списывает и не шлёт", async () => {
    getOrderByPaylinkProductId.mockResolvedValue(null);

    const res = await handlePaymentVerification(callback({ status: "successful", uid: "nope" }));

    expect(redirectPath(res)).toBe("/success");
    expect(updateInventoryAfterPurchase).not.toHaveBeenCalled();
    expect(sendCustomerPaymentConfirmation).not.toHaveBeenCalled();
  });

  it("если списание не удалось, не помечает инвентарь обновлённым", async () => {
    getOrderByPaylinkProductId.mockResolvedValue(dbOrder());
    updateInventoryAfterPurchase.mockResolvedValue({ allSuccessful: false, digitalCredentials: [] });

    await handlePaymentVerification(callback({ status: "successful", uid: "pl_1" }));

    expect(markInventoryAsUpdated).not.toHaveBeenCalled();
  });

  it("сбой письма покупателю не мешает письму магазину", async () => {
    getOrderByPaylinkProductId.mockResolvedValue(dbOrder());
    sendCustomerPaymentConfirmation.mockRejectedValue(new Error("smtp"));

    const res = await handlePaymentVerification(callback({ status: "successful", uid: "pl_1" }));

    expect(redirectPath(res)).toBe("/success");
    expect(markEmailAsSent).not.toHaveBeenCalledWith("pl_1", "customer");
    expect(markEmailAsSent).toHaveBeenCalledWith("pl_1", "store");
  });

  it("исключение внутри обработки не превращается в 500 для покупателя", async () => {
    getOrderByPaylinkProductId.mockRejectedValue(new Error("boom"));

    const res = await handlePaymentVerification(callback({ status: "successful", uid: "pl_1" }));

    expect(redirectPath(res)).toBe("/success");
  });
});

describe("handlePaymentVerification: заказ найден в памяти", () => {
  it("использует данные из памяти и не ищет заказ в БД", async () => {
    getStoredOrderData.mockReturnValue(memoryOrder);
    markOrderAsPaid.mockResolvedValue({ orderId: "ORD-1" });

    await handlePaymentVerification(callback({ status: "successful", uid: "pl_1" }));

    expect(getOrderByPaylinkProductId).not.toHaveBeenCalled();
    expect(updateInventoryAfterPurchase).toHaveBeenCalledWith(memoryOrder.items);
    expect(sendCustomerPaymentConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 15000 }),
      creds
    );
  });

  it("если заказ не удалось пометить оплаченным, ничего не списывает", async () => {
    getStoredOrderData.mockReturnValue(memoryOrder);
    markOrderAsPaid.mockResolvedValue(null);

    await handlePaymentVerification(callback({ status: "successful", uid: "pl_1" }));

    expect(updateInventoryAfterPurchase).not.toHaveBeenCalled();
  });
});
