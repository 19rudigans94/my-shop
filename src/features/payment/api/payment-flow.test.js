import { describe, it, expect, vi, beforeEach } from "vitest";

// Сквозной сценарий «создали ссылку → PayLink вернул покупателя» с настоящим
// entities/order/api и фейковой коллекцией заказов вместо Mongo.
const { orders, FakeOrder } = vi.hoisted(() => {
  const orders = [];
  const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);
  const matches = (doc, filter) => Object.entries(filter).every(([k, v]) => get(doc, k) === v);

  class FakeOrder {
    constructor(data) {
      Object.assign(this, data);
    }
    async save() {
      if (!orders.includes(this)) orders.push(this);
      return this;
    }
    static async findOne(filter) {
      return orders.find((o) => matches(o, filter)) || null;
    }
    static async updateOne(filter, update) {
      const doc = orders.find((o) => matches(o, filter));
      if (doc) {
        for (const [k, v] of Object.entries(update)) {
          const keys = k.split(".");
          const last = keys.pop();
          const target = keys.reduce((o, key) => (o[key] ??= {}), doc);
          target[last] = v;
        }
      }
      return { matchedCount: doc ? 1 : 0 };
    }
  }
  return { orders, FakeOrder };
});

vi.mock("@/shared/lib/db/mongodb", () => ({ default: vi.fn().mockResolvedValue({}) }));
vi.mock("@/entities/order/model/schema", () => ({ default: FakeOrder }));
vi.mock("@/shared/lib/email", () => ({
  sendCustomerPaymentConfirmation: vi.fn().mockResolvedValue(true),
  sendStoreOrderNotification: vi.fn().mockResolvedValue(true),
}));
vi.mock("@/features/payment/api/inventory", () => ({
  updateInventoryAfterPurchase: vi.fn(),
}));

import { sendCustomerPaymentConfirmation } from "@/shared/lib/email";
import { updateInventoryAfterPurchase } from "@/features/payment/api/inventory";
import { handleCreatePayLink } from "./create-paylink";
import { handlePaymentVerification } from "./verify-payment";

const cartData = {
  customerInfo: { name: "Иван", email: "ivan@example.com" },
  items: [{ id: "dc1", title: "Elden Ring", price: 15000, quantity: 1, type: "game", variant: "digital", platform: "PS5" }],
  totalItems: 1,
  totalPrice: 15000,
};

async function createPaymentLink(paylinkId) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: paylinkId }), { status: 200 }))
  );
  const res = await handleCreatePayLink(
    new Request("http://localhost/api/paylink", { method: "POST", body: JSON.stringify({ cartData }) })
  );
  expect(res.status).toBe(200);
}

function paylinkReturns(uid) {
  return handlePaymentVerification(
    new Request(`https://goldgames.test/api/paylink/verification?status=successful&uid=${uid}&token=t`)
  );
}

beforeEach(() => {
  orders.length = 0;
  global.pendingOrders = undefined;
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("PAYLINK_SHOP_ID", "shop");
  vi.stubEnv("PAYLINK_SHOP_SECRET", "secret");
  updateInventoryAfterPurchase.mockResolvedValue({ allSuccessful: true, digitalCredentials: [] });
});

describe("оплата: создание ссылки → возврат с PayLink", () => {
  it("после перезапуска сервера (данных в памяти нет) заказ обрабатывается из БД", async () => {
    await createPaymentLink("pl_1");
    global.pendingOrders = undefined; // имитация рестарта контейнера

    await paylinkReturns("pl_1");

    expect(orders[0].paymentStatus).toBe("successful");
    expect(updateInventoryAfterPurchase).toHaveBeenCalledOnce();
    expect(sendCustomerPaymentConfirmation).toHaveBeenCalledOnce();
  });

  it("повторный возврат на тот же заказ не выдаёт товар второй раз", async () => {
    await createPaymentLink("pl_1");
    global.pendingOrders = undefined;

    await paylinkReturns("pl_1");
    await paylinkReturns("pl_1");

    expect(updateInventoryAfterPurchase).toHaveBeenCalledOnce();
    expect(sendCustomerPaymentConfirmation).toHaveBeenCalledOnce();
  });

  // ИЗВЕСТНЫЙ БАГ: если данные заказа ещё в памяти (обычный случай: покупатель
  // оплатил в течение часа и сервер не перезапускался), verify-payment вызывает
  // markOrderAsPaid(uid), где uid — это id ссылки PayLink, а markOrderAsPaid ищет
  // по orderId ("ORD-..."). Заказ не находится, обработка обрывается: остатки не
  // списываются, письмо с аккаунтами не уходит, заказ остаётся pending.
  // Когда баг будет исправлен, замените it.fails на it.
  it.fails("сразу после оплаты (данные в памяти) заказ помечается оплаченным и обрабатывается", async () => {
    await createPaymentLink("pl_1");

    await paylinkReturns("pl_1");

    expect(orders[0].paymentStatus).toBe("successful");
    expect(updateInventoryAfterPurchase).toHaveBeenCalledOnce();
    expect(sendCustomerPaymentConfirmation).toHaveBeenCalledOnce();
  });

  // ИЗВЕСТНЫЙ БАГ: markInventoryAsUpdated / markEmailAsSent получают uid ссылки
  // PayLink вместо orderId, поэтому флаги в заказе никогда не выставляются.
  it.fails("после обработки в заказе отмечены списание и отправка писем", async () => {
    await createPaymentLink("pl_1");
    global.pendingOrders = undefined;

    await paylinkReturns("pl_1");

    expect(orders[0].inventoryUpdated).toBe(true);
    expect(orders[0].emailsSent?.customerNotified).toBe(true);
  });
});
