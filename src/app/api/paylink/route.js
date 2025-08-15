import { NextResponse } from "next/server";
import { getTimePlus30Minutes } from "../../utils/lifeTime";
import { createOrder, storeOrderDataForProcessing } from "../../utils/orders";

/**
 * Серверный API маршрут для создания продуктов в PayLink.kz
 *
 * Решает проблему CORS, так как запросы к PayLink выполняются на сервере,
 * а клиент обращается только к нашему API.
 *
 * POST /api/paylink
 * Body: { cartData: { totalPrice, totalItems, items } }
 */
export async function POST(request) {
  console.log("🚀 Серверный API PayLink: начало обработки запроса");
  const expired_at = getTimePlus30Minutes();
  try {
    const { cartData } = await request.json();
    console.log("📦 Получены данные корзины:", cartData);

    // Получаем секретные данные из серверных переменных окружения
    const shopSecret = process.env.PAYLINK_SHOP_SECRET;
    const shopId = process.env.PAYLINK_SHOP_ID;
    const returnUrl =
      process.env.PAYLINK_RETURN_URL ||
      process.env.NEXT_PUBLIC_PAYLINK_RETURN_URL ||
      "https://goldgames.kz/api/paylink/verification";

    console.log("🔑 Серверная конфигурация PayLink:");
    console.log(
      "- Shop ID:",
      shopId ? `***${shopId.slice(-4)}` : "❌ НЕ УСТАНОВЛЕН"
    );
    console.log(
      "- Shop Secret:",
      shopSecret ? `***${shopSecret.slice(-8)}` : "❌ НЕ УСТАНОВЛЕН"
    );
    console.log("- Return URL:", returnUrl);

    // Проверяем наличие обязательных параметров
    if (!shopId || !shopSecret) {
      console.error("🚨 ОШИБКА: Отсутствуют серверные переменные окружения!");
      console.error("Необходимо установить:");
      console.error("- PAYLINK_SHOP_ID:", shopId ? "✅" : "❌");
      console.error("- PAYLINK_SHOP_SECRET:", shopSecret ? "✅" : "❌");

      return NextResponse.json(
        {
          success: false,
          error:
            "Сервер не настроен для работы с PayLink. Обратитесь к администратору.",
          details: "Отсутствуют серверные переменные окружения",
        },
        { status: 500 }
      );
    }

    // Формируем данные для PayLink
    const baseData = {
      currency: "KZT",
      infinite: true,
      test: process.env.NODE_ENV !== "production", // автоматически в зависимости от окружения
      immortal: false,
      expired_at: expired_at,
      return_url: returnUrl,
      shop_id: shopId,
      language: "ru",
      transaction_type: "payment",
    };

    // Формируем описание заказа
    const orderDescription =
      cartData.items && cartData.items.length > 0
        ? `Заказ: ${cartData.items
            .map((item) => `${item.title} (${item.quantity}шт)`)
            .join(", ")}`
        : "Заказ из интернет-магазина";

    const orderName =
      cartData.totalItems > 1
        ? `Заказ из ${cartData.totalItems} товар${
            cartData.totalItems > 4 ? "ов" : cartData.totalItems > 1 ? "а" : ""
          }`
        : cartData.items?.[0]?.title || "Покупка в интернет-магазине";

    console.log("📋 Формирование заказа:");
    console.log("- Название:", orderName);
    console.log("- Описание:", orderDescription);
    console.log("- Цена (тенге):", cartData.totalPrice);
    console.log("- Сумма для PayLink (тиыны):", cartData.totalPrice * 100);

    const payload = {
      name: orderName,
      description: orderDescription,
      amount: (cartData.totalPrice * 100).toString(),
      ...baseData,
    };

    console.log("📤 Отправка запроса к PayLink API...");

    // Выполняем запрос к PayLink API на сервере
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

    console.log("📡 Ответ от PayLink API:");
    console.log("- Статус:", response.status, response.statusText);

    if (!response.ok) {
      console.error("❌ Ошибка от PayLink API:");
      console.error("- Статус:", response.status);
      console.error("- Статус текст:", response.statusText);

      let error;
      let errorMessage = "Ошибка при создании ссылки для оплаты";

      try {
        // Пытаемся получить текст ответа
        const responseText = await response.text();
        console.error("- Тело ответа:", responseText.substring(0, 200));

        // Пытаемся парсить как JSON
        try {
          error = JSON.parse(responseText);
          console.error("- JSON ошибка:", error);
        } catch (jsonError) {
          // Если не JSON, создаем объект ошибки
          console.error("- Ответ не в формате JSON");
          error = {
            message: responseText.includes("<!DOCTYPE")
              ? "Сервер PayLink временно недоступен"
              : responseText,
            status: response.status,
          };
        }

        // Определяем сообщение об ошибке в зависимости от статуса
        if (response.status === 502) {
          errorMessage = "Сервис оплаты временно недоступен. Попробуйте позже.";
        } else if (response.status === 503) {
          errorMessage = "Сервис оплаты на техническом обслуживании.";
        } else if (response.status >= 500) {
          errorMessage = "Временные проблемы с сервисом оплаты.";
        } else if (response.status === 401) {
          errorMessage = "Ошибка авторизации с сервисом оплаты.";
        } else if (response.status === 400) {
          errorMessage = "Некорректные данные заказа.";
        }
      } catch (textError) {
        console.error("- Ошибка при получении тела ответа:", textError);
        error = {
          message: "Неизвестная ошибка сервиса оплаты",
          status: response.status,
        };
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: error,
          status: response.status,
        },
        { status: response.status }
      );
    }

    let result;
    try {
      result = await response.json();
      console.log("✅ Успешный ответ от PayLink:");
      console.log("- ID продукта:", result.id);
      console.log("- Ссылка оплаты:", result.pay_url);
    } catch (parseError) {
      console.error("❌ Ошибка парсинга успешного ответа от PayLink:");
      console.error("- Ошибка:", parseError.message);

      return NextResponse.json(
        {
          success: false,
          error: "Ошибка обработки ответа от сервиса оплаты",
          details: { message: parseError.message },
        },
        { status: 500 }
      );
    }

    // Сохраняем заказ в базе данных
    try {
      console.log("💾 Начинаем сохранение заказа в БД...");
      // Добавляем PayLink product ID к данным заказа
      const orderDataWithPayLink = {
        ...cartData,
        paylinkProductId: result.id,
      };
      const orderId = await createOrder(orderDataWithPayLink);
      console.log(`✅ Заказ ${orderId} успешно создан в базе данных`);

      // Сохраняем данные заказа для последующей обработки после оплаты
      // Используем ID продукта PayLink как ключ для связи
      console.log(`💾 Сохраняем данные заказа с ключом ${result.id}...`);
      storeOrderDataForProcessing(result.id, cartData);
      console.log(`✅ Данные заказа сохранены для последующей обработки`);
    } catch (dbError) {
      console.error("❌ Ошибка при работе с базой данных:");
      console.error("- Тип ошибки:", dbError.name);
      console.error("- Сообщение:", dbError.message);
      console.error("- Стек:", dbError.stack);

      // Сохраняем данные заказа даже если БД недоступна
      console.log("⚠️ Сохраняем данные заказа только в памяти...");
      storeOrderDataForProcessing(result.id, cartData);
      console.log("✅ Данные заказа сохранены в памяти (БД недоступна)");

      // Не блокируем процесс оплаты из-за ошибки БД
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("💥 Серверная ошибка при обработке PayLink запроса:");
    console.error("- Тип:", error.name);
    console.error("- Сообщение:", error.message);
    console.error("- Стек:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Внутренняя ошибка сервера при создании платежа",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
