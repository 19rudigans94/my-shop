import { NextResponse } from "next/server";
import { getTimePlus30Minutes } from "@/shared/lib/time";
import { createOrder, storeOrderDataForProcessing } from "@/entities/order/api";

export async function handleCreatePayLink(request) {
  const expired_at = getTimePlus30Minutes();
  try {
    const { cartData } = await request.json();

    const shopSecret = process.env.PAYLINK_SHOP_SECRET;
    const shopId = process.env.PAYLINK_SHOP_ID;
    const returnUrl =
      process.env.PAYLINK_RETURN_URL ||
      process.env.NEXT_PUBLIC_PAYLINK_RETURN_URL ||
      "https://goldgames.kz/api/paylink/verification";

    if (!shopId || !shopSecret) {
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

    const baseData = {
      currency: "KZT",
      infinite: true,
      test: process.env.NODE_ENV !== "production",
      immortal: false,
      expired_at: expired_at,
      return_url: returnUrl,
      shop_id: shopId,
      language: "ru",
      transaction_type: "payment",
    };

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

    const payload = {
      name: orderName,
      description: orderDescription,
      amount: (cartData.totalPrice * 100).toString(),
      ...baseData,
    };

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
      let error;
      let errorMessage = "Ошибка при создании ссылки для оплаты";

      try {
        const responseText = await response.text();
        try {
          error = JSON.parse(responseText);
        } catch {
          error = {
            message: responseText.includes("<!DOCTYPE")
              ? "Сервер PayLink временно недоступен"
              : responseText,
            status: response.status,
          };
        }

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
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Ошибка обработки ответа от сервиса оплаты",
          details: { message: parseError.message },
        },
        { status: 500 }
      );
    }

    try {
      const orderDataWithPayLink = {
        ...cartData,
        paylinkProductId: result.id,
      };
      const orderId = await createOrder(orderDataWithPayLink);
      storeOrderDataForProcessing(result.id, cartData);
    } catch (dbError) {
      console.error("Ошибка при сохранении заказа в БД:", dbError.message);
      storeOrderDataForProcessing(result.id, cartData);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Ошибка при обработке PayLink запроса:", error.message);
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
