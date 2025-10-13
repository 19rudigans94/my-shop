import { NextResponse } from "next/server";

async function handleSimpleVerification(request) {
  try {
    console.log("🚀 Simple verification callback получен");
    console.log("📍 URL:", request.url);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const uid = searchParams.get("uid");
    const amount = searchParams.get("amount");
    const paymentId = searchParams.get("paymentId");

    // Логируем все параметры
    console.log("📋 Параметры от PayLink:", {
      status,
      uid,
      amount,
      paymentId,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (!uid) {
      console.error("❌ UID не предоставлен");
      return NextResponse.redirect(
        new URL(
          "/failed?error=invalid_request&message=Отсутствует UID",
          request.url
        )
      );
    }

    if (status === "successful") {
      console.log("✅ Успешный платеж - перенаправляем на success");

      // Формируем URL для перенаправления
      const successUrl = new URL("/success", request.url);
      successUrl.searchParams.set("uid", uid);
      if (amount) successUrl.searchParams.set("amount", amount);
      if (paymentId) successUrl.searchParams.set("paymentId", paymentId);

      console.log("🔄 Перенаправление на:", successUrl.toString());

      return NextResponse.redirect(successUrl);
    } else {
      console.log("❌ Неуспешный платеж - перенаправляем на failed");

      // Формируем URL для ошибки
      const failedUrl = new URL("/failed", request.url);
      failedUrl.searchParams.set("error", "payment_failed");
      failedUrl.searchParams.set("message", "Платеж не прошел");
      failedUrl.searchParams.set("uid", uid);

      console.log("🔄 Перенаправление на:", failedUrl.toString());

      return NextResponse.redirect(failedUrl);
    }
  } catch (error) {
    console.error("❌ Ошибка в simple verification:", error);

    // В случае любой ошибки - перенаправляем на failed
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
  return handleSimpleVerification(request);
}

export async function POST(request) {
  return handleSimpleVerification(request);
}
