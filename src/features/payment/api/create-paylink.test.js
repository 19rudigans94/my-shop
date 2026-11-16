import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/entities/order/api", () => ({
  createOrder: vi.fn(),
  storeOrderDataForProcessing: vi.fn(),
}));

import { createOrder, storeOrderDataForProcessing } from "@/entities/order/api";
import { handleCreatePayLink } from "./create-paylink";

const cartData = {
  customerInfo: { name: "Иван", email: "ivan@example.com", phone: "+77000000000" },
  items: [
    { id: "g1", title: "Elden Ring", price: 15000, quantity: 1, type: "game", variant: "digital" },
    { id: "c1", title: "PS5", price: 250000, quantity: 2, type: "console" },
  ],
  totalItems: 3,
  totalPrice: 515000,
};

function makeRequest(body) {
  return new Request("http://localhost/api/paylink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("PAYLINK_SHOP_ID", "shop-1");
  vi.stubEnv("PAYLINK_SHOP_SECRET", "secret-1");
  vi.stubEnv("PAYLINK_RETURN_URL", "https://example.test/api/paylink/verification");
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("handleCreatePayLink: конфигурация", () => {
  it("без PAYLINK_SHOP_ID/SECRET отвечает 500 и не ходит в PayLink", async () => {
    vi.stubEnv("PAYLINK_SHOP_SECRET", "");

    const res = await handleCreatePayLink(makeRequest({ cartData }));

    expect(res.status).toBe(500);
    expect((await res.json()).success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
  });
});

describe("handleCreatePayLink: запрос в PayLink", () => {
  it("отправляет сумму в тиынах, Basic-auth и данные заказа", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "pl_123", url: "https://pay.test/pl_123" }));
    createOrder.mockResolvedValue("ORD-1");

    const res = await handleCreatePayLink(makeRequest({ cartData }));

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.paylink.kz/products");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from("shop-1:secret-1").toString("base64")}`
    );

    const payload = JSON.parse(init.body);
    expect(payload.amount).toBe("51500000");
    expect(payload.currency).toBe("KZT");
    expect(payload.shop_id).toBe("shop-1");
    expect(payload.return_url).toBe("https://example.test/api/paylink/verification");
    expect(payload.transaction_type).toBe("payment");
    expect(payload.name).toBe("Заказ из 3 товара");
    expect(payload.description).toBe("Заказ: Elden Ring (1шт), PS5 (2шт)");
    expect(new Date(payload.expired_at).getTime()).toBeGreaterThan(Date.now());
    // В тестах NODE_ENV=test, поэтому платёж уходит в тестовом режиме
    expect(payload.test).toBe(true);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: { id: "pl_123", url: "https://pay.test/pl_123" },
    });
  });

  it("в production отправляет боевой (не тестовый) платёж", async () => {
    vi.stubEnv("NODE_ENV", "production");
    fetchMock.mockResolvedValue(jsonResponse({ id: "pl_1" }));

    await handleCreatePayLink(makeRequest({ cartData }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).test).toBe(false);
  });

  it("для одного товара называет заказ по названию товара", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "pl_1" }));
    const single = { ...cartData, items: [cartData.items[0]], totalItems: 1, totalPrice: 15000 };

    await handleCreatePayLink(makeRequest({ cartData: single }));

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.name).toBe("Elden Ring");
    expect(payload.amount).toBe("1500000");
  });

  it("для 5+ товаров использует окончание «товаров»", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "pl_1" }));

    await handleCreatePayLink(makeRequest({ cartData: { ...cartData, totalItems: 5 } }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).name).toBe("Заказ из 5 товаров");
  });
});

describe("handleCreatePayLink: сохранение заказа", () => {
  it("создаёт заказ с paylinkProductId и кладёт данные во временное хранилище", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "pl_123" }));
    createOrder.mockResolvedValue("ORD-1");

    await handleCreatePayLink(makeRequest({ cartData }));

    expect(createOrder).toHaveBeenCalledWith({ ...cartData, paylinkProductId: "pl_123" });
    expect(storeOrderDataForProcessing).toHaveBeenCalledWith("pl_123", cartData);
  });

  it("если БД упала, всё равно отдаёт ссылку на оплату и сохраняет заказ в памяти", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "pl_123" }));
    createOrder.mockRejectedValue(new Error("mongo down"));

    const res = await handleCreatePayLink(makeRequest({ cartData }));

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(storeOrderDataForProcessing).toHaveBeenCalledWith("pl_123", cartData);
  });
});

describe("handleCreatePayLink: ошибки PayLink", () => {
  it.each([
    [502, "Сервис оплаты временно недоступен. Попробуйте позже."],
    [503, "Сервис оплаты на техническом обслуживании."],
    [500, "Временные проблемы с сервисом оплаты."],
    [401, "Ошибка авторизации с сервисом оплаты."],
    [400, "Некорректные данные заказа."],
    [404, "Ошибка при создании ссылки для оплаты"],
  ])("HTTP %i → понятное сообщение и тот же статус, заказ не создаётся", async (status, message) => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "nope" }, status));

    const res = await handleCreatePayLink(makeRequest({ cartData }));

    expect(res.status).toBe(status);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe(message);
    expect(createOrder).not.toHaveBeenCalled();
    expect(storeOrderDataForProcessing).not.toHaveBeenCalled();
  });

  it("HTML-страница ошибки от PayLink не протекает клиенту целиком", async () => {
    fetchMock.mockResolvedValue(
      new Response("<!DOCTYPE html><html>Bad Gateway</html>", { status: 502 })
    );

    const res = await handleCreatePayLink(makeRequest({ cartData }));

    expect((await res.json()).details.message).toBe("Сервер PayLink временно недоступен");
  });

  it("невалидный JSON в успешном ответе → 500", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));

    const res = await handleCreatePayLink(makeRequest({ cartData }));

    expect(res.status).toBe(500);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("сетевая ошибка → 500 без падения", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const res = await handleCreatePayLink(makeRequest({ cartData }));

    expect(res.status).toBe(500);
    expect((await res.json()).success).toBe(false);
  });
});

describe("handleCreatePayLink: известные риски", () => {
  // Сейчас сумма платежа берётся из cartData.totalPrice, присланного клиентом.
  // Когда появится пересчёт цены на сервере по БД, замените it.fails на it.
  it.fails("не доверяет сумме, присланной клиентом", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "pl_1" }));
    const tampered = { ...cartData, totalPrice: 1 };

    await handleCreatePayLink(makeRequest({ cartData: tampered }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).amount).toBe("51500000");
  });
});
