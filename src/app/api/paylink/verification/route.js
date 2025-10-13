import { NextRequest, NextResponse } from "next/server";
import useCartStore from "@/app/store/useCartStore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  if (status === "successful") {
    // 1. Найти заказ в локалсторедж
    const order = localStorage.getItem(`order-${uid}`);
    if (!order) {
      return NextResponse.redirect(new URL("/failed", request.url));
    }
    const orderData = JSON.parse(order);
    // 2. Обновить статус в локалсторедж
    orderData.status = "successful";
    orderData.paymentId = paymentId;
    orderData.amount = amount;
    localStorage.setItem(`order-${uid}`, JSON.stringify(orderData));
    // 2. Обновить статус в БД.
    await updateOrder(orderData);
    await sendEmail(orderData);
    await sendNotification(orderData);
    await clearCart();
    // 3. Вернуть успешный ответ или редирект
    console.log(`Оплата успешна. UID: ${uid}`);

    // Можно перенаправить пользователя на страницу успеха
    return NextResponse.redirect(new URL("/success", request.url));
  }

  // Иначе ошибка или отмена
  return NextResponse.redirect(new URL("/failed", request.url));
}
