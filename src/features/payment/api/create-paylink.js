import { NextResponse } from "next/server";
import { getTimePlus30Minutes } from "@/shared/lib/time";
import {
  createOrder,
  setOrderPaylinkProductId,
  cancelPendingOrder,
} from "@/entities/order/api";
import { priceCart, CartValidationError } from "@/features/payment/api/price-cart";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCustomerInfo(customerInfo) {
  const email = String(customerInfo?.email || "").trim();
  const phoneNumber = String(customerInfo?.phoneNumber || "").trim();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    throw new CartValidationError("Некорректный email");
  }
  if (phoneNumber.replace(/\D/g, "").length < 10 || phoneNumber.length > 32) {
    throw new CartValidationError("Некорректный номер телефона");
  }
  return { email, phoneNumber };
}

function withOrderParam(url, orderId) {
  const u = new URL(url);
  u.searchParams.set("order", orderId);
  return u.toString();
}

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

    // Сумма считается только по ценам из БД. totalPrice/price от клиента игнорируются.
    let priced;
    let customerInfo;
    try {
      priced = await priceCart(cartData?.items);
      customerInfo = parseCustomerInfo(cartData?.customerInfo);
    } catch (error) {
      if (error instanceof CartValidationError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Заказ создается до ссылки на оплату, чтобы его ID попал в return_url
    const orderId = await createOrder({ ...priced, customerInfo });

    const orderDescription = `Заказ ${orderId}: ${priced.items
      .map((item) => `${item.name} (${item.quantity}шт)`)
      .join(", ")}`;

    const orderName =
      priced.totalItems > 1
        ? `Заказ из ${priced.totalItems} товар${priced.totalItems > 4 ? "ов" : "а"}`
        : priced.items[0].name;

    const payload = {
      name: orderName,
      description: orderDescription,
      amount: Math.round(priced.totalPrice * 100).toString(),
      currency: "KZT",
      infinite: true,
      test: process.env.NODE_ENV !== "production",
      immortal: false,
      expired_at: expired_at,
      return_url: withOrderParam(returnUrl, orderId),
      shop_id: shopId,
      language: "ru",
      transaction_type: "payment",
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
      await cancelPendingOrder(orderId);
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
      await cancelPendingOrder(orderId);
      return NextResponse.json(
        {
          success: false,
          error: "Ошибка обработки ответа от сервиса оплаты",
          details: { message: parseError.message },
        },
        { status: 500 }
      );
    }

    await setOrderPaylinkProductId(orderId, result.id);

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
