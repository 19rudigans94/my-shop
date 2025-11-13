import { getTimePlus30Minutes } from "@/app/utils/lifeTime";
import { createOrder } from "./orderService";

/**
 * Создать платежную ссылку PayLink
 */
export async function createPayLink(cartData, request) {
  // Проверка обязательных переменных окружения
  const shopSecret = process.env.PAYLINK_SHOP_SECRET;
  const shopId = process.env.PAYLINK_SHOP_ID;

  if (!shopId || !shopSecret) {
    throw new Error("Не настроены переменные окружения PayLink");
  }

  // Формирование return URL
  let returnUrl = process.env.PAYLINK_RETURN_URL;
  if (!returnUrl) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "goldgames.kz";
    returnUrl = `${protocol}://${host}/api/paylink/simple-verification`;
  }

  const expired_at = getTimePlus30Minutes();

  // Формирование названия и описания заказа
  const orderName =
    cartData.items?.[0]?.title || "Покупка в интернет-магазине";
  const orderDescription =
    cartData.items
      ?.map((item) => `${item.title} (${item.quantity}шт)`)
      .join(", ") || "Заказ из интернет-магазина";

  // Данные для PayLink API
  const payload = {
    name: orderName,
    description: orderDescription,
    currency: "KZT",
    amount: Math.round(cartData.totalPrice * 100),
    infinite: true,
    test: false,
    immortal: false,
    expired_at: expired_at,
    language: "ru",
    return_url: returnUrl,
    webhook_url: returnUrl,
  };

  // Отправка запроса к PayLink API
  const authString = `${shopId}:${shopSecret}`;
  const base64Auth = Buffer.from(authString).toString("base64");

  const response = await fetch("https://api.paylink.kz/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${base64Auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch (e) {
      error = { message: errorText };
    }
    throw new Error(JSON.stringify(error));
  }

  const result = await response.json();

  // Сохранение заказа в БД
  if (result && result.uid) {
    try {
      const orderData = {
        uid: result.uid,
        items: cartData.items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          category: item.category,
          image: item.image,
          platform: item.platform,
          type:
            item.category === "games" && item.platform ? "digital" : "physical",
        })),
        totalPrice: cartData.totalPrice,
        totalItems: cartData.totalItems,
        contactData: cartData.contactData,
        status: "pending",
      };

      await createOrder(orderData);
    } catch (dbError) {
      console.error("❌ Ошибка при сохранении заказа в БД:", dbError);
      // Продолжаем выполнение, даже если не удалось сохранить в БД
    }
  }

  return result;
}
