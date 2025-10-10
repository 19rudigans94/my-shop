import { NextRequest, NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  if (status === "successful") {
    // 1. Найти заказ по uid или token.
    // 2. Обновить статус в БД.
    // 3. Вернуть успешный ответ или редирект
    console.log(`Оплата успешна. UID: ${uid}`);

    // Можно перенаправить пользователя на страницу успеха
    return NextResponse.redirect(new URL("/success", request.url));
  }

  // Иначе ошибка или отмена
  return NextResponse.redirect(new URL("/failed", request.url));
}
