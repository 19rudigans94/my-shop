import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

async function handleVerification(request) {
  try {
    console.log("🔄 PayLink verification callback получен");
    console.log("📍 URL:", request.url);
    console.log("🌐 Headers:", Object.fromEntries(request.headers.entries()));

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");
    const paymentId = searchParams.get("paymentId");
    const amount = searchParams.get("amount");
    const errorCode = searchParams.get("error_code");
    const errorMessage = searchParams.get("error_message");

    // Логируем все параметры, которые пришли от PayLink
    console.log(
      "📋 Все параметры от PayLink:",
      Object.fromEntries(searchParams.entries())
    );

    console.log("🔍 Verification request:", {
      status,
      uid,
      token,
      paymentId,
      amount,
      errorCode,
      errorMessage,
    });

    if (!uid) {
      console.error("❌ UID не предоставлен");
      return NextResponse.redirect(
        new URL(
          "/failed?error=invalid_request&message=Отсутствует идентификатор заказа",
          request.url
        )
      );
    }

    if (status === "successful") {
      console.log("✅ Успешный платеж, перенаправляем на success");
      console.log(
        "📧 Email будет отправлен на странице success на основе данных из localStorage"
      );

      // Простое перенаправление без зависимости от БД для избежания зависания
      const successUrl = new URL("/success", request.url);
      successUrl.searchParams.set("uid", uid);
      if (amount) successUrl.searchParams.set("amount", amount);
      if (paymentId) successUrl.searchParams.set("paymentId", paymentId);

      console.log("🔄 Перенаправляем на:", successUrl.toString());

      return NextResponse.redirect(successUrl);
    } else {
      // Определяем тип ошибки на основе статуса и кода ошибки
      let errorType = "payment_failed";
      let userMessage = "Платеж не прошел";

      // Обработка специфичных кодов ошибок PayLink
      if (errorCode) {
        switch (errorCode) {
          case "F.0998":
            errorType = "payment_cancelled";
            userMessage = "Платеж отменен или не завершен";
            break;
          case "F.0001":
            errorType = "insufficient_funds";
            userMessage = "Недостаточно средств на карте";
            break;
          case "F.0002":
            errorType = "card_declined";
            userMessage = "Карта отклонена банком";
            break;
          case "F.0003":
            errorType = "expired_card";
            userMessage = "Срок действия карты истек";
            break;
          case "F.0004":
            errorType = "invalid_card";
            userMessage = "Неверные данные карты";
            break;
          default:
            userMessage = errorMessage || "Платеж не прошел";
        }
      }

      // Логируем неуспешный платеж (БД обновление убираем для избежания зависания)
      console.log("❌ Неуспешный платеж, детали:", {
        uid,
        status,
        errorCode,
        errorMessage,
      });

      console.log(
        `❌ Платеж неуспешен. UID: ${uid}, Status: ${status}, Error: ${errorCode}`
      );

      // Перенаправляем на страницу ошибки с детальными данными
      const failedUrl = new URL("/failed", request.url);
      failedUrl.searchParams.set("error", errorType);
      failedUrl.searchParams.set("message", userMessage);
      failedUrl.searchParams.set("uid", uid);
      if (errorCode) failedUrl.searchParams.set("code", errorCode);

      return NextResponse.redirect(failedUrl);
    }
  } catch (error) {
    console.error("❌ Критическая ошибка в verification:", error);
    return NextResponse.redirect(
      new URL(
        "/failed?error=system_error&message=Системная ошибка",
        request.url
      )
    );
  }
}

// Экспортируем обработчики для GET и POST методов
export async function GET(request) {
  return handleVerification(request);
}

export async function POST(request) {
  return handleVerification(request);
}
