import { NextResponse } from "next/server";
import { getTimePlus30Minutes } from "../../utils/lifeTime";

export async function POST(request) {
  try {
    const { cartData } = await request.json();
    console.log("📦 Данные корзины:", JSON.stringify(cartData, null, 2));

    const expired_at = getTimePlus30Minutes();

    // Базовые переменные окружения
    const shopSecret = process.env.PAYLINK_SHOP_SECRET;
    const shopId = process.env.PAYLINK_SHOP_ID;
    const returnUrl = process.env.PAYLINK_RETURN_URL;

    console.log("🔗 Return URL:", returnUrl);

    // Проверяем обязательные переменные
    if (!shopId || !shopSecret) {
      console.error("❌ Отсутствуют переменные окружения PayLink");
      return NextResponse.json(
        { success: false, error: "Не настроены переменные окружения PayLink" },
        { status: 500 }
      );
    }

    // Формируем название и описание заказа
    const orderName =
      cartData.items?.[0]?.title || "Покупка в интернет-магазине";
    const orderDescription =
      cartData.items
        ?.map((item) => `${item.title} (${item.quantity}шт)`)
        .join(", ") || "Заказ из интернет-магазина";

    // Данные для PayLink API согласно документации
    const payload = {
      name: orderName,
      description: orderDescription,
      currency: "KZT",
      amount: Math.round(cartData.totalPrice * 100),
      infinite: false,
      test: false,
      immortal: false,
      expired_at: expired_at, // обязательно если не immortal
      language: "ru", // двухбуквенный формат
      return_url: returnUrl,
    };

    console.log("📤 Payload для PayLink:", JSON.stringify(payload, null, 2));

    // Отправляем запрос к PayLink API
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
      console.error("❌ Ошибка PayLink API:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText };
      }

      return NextResponse.json(
        { success: false, error: error },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
