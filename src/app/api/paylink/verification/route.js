import { NextResponse } from "next/server";

/**
 * Обрабатывает GET-запрос после оплаты через Paylink.kz.
 * Пример запроса: /api/paylink/verification?status=successful&uid=...&token=...
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  if (status === "successful") {
    console.log(`✅ Оплата прошла успешно. UID: ${uid}, Token: ${token}`);

    // Здесь можно вызвать свою функцию для обновления заказа в базе
    // await markOrderAsPaid(uid, token);

    return NextResponse.redirect(new URL("/success", request.url));
  }

  console.log(`❌ Оплата не прошла. UID: ${uid}, Token: ${token}`);
  return NextResponse.redirect(new URL("/failed", request.url));
}
