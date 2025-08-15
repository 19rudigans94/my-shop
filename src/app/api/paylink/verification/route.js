import { NextResponse } from "next/server";
import {
  markOrderAsPaid,
  getStoredOrderData,
  markEmailAsSent,
  markInventoryAsUpdated,
} from "@/app/utils/orders";
import {
  sendCustomerPaymentConfirmation,
  sendStoreOrderNotification,
} from "@/app/utils/sendEmail";
import { updateInventoryAfterPurchase } from "@/app/utils/inventory";

/**
 * Обрабатывает GET-запрос после оплаты через Paylink.kz.
 * Пример запроса: /api/paylink/verification?status=successful&uid=...&token=...
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  console.log(
    `🔔 Получен callback от PayLink: status=${status}, uid=${uid}, token=${token}`
  );

  if (status === "successful") {
    console.log(`✅ Оплата прошла успешно. UID: ${uid}, Token: ${token}`);

    try {
      // Получаем сохраненные данные заказа
      const orderData = getStoredOrderData(uid);
      if (!orderData) {
        console.error(`❌ Данные заказа для UID ${uid} не найдены`);
        return NextResponse.redirect(new URL("/success", request.url));
      }

      console.log(`📦 Найдены данные заказа для UID ${uid}`);

      // Обновляем статус заказа в базе данных
      const order = await markOrderAsPaid(uid, { uid, token });
      if (!order) {
        console.error(`❌ Не удалось обновить заказ ${uid}`);
        return NextResponse.redirect(new URL("/success", request.url));
      }

      // Параллельно выполняем все операции
      const emailData = {
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        totalAmount: orderData.totalPrice,
        orderId: uid,
      };

      const operations = await Promise.allSettled([
        // Отправка email покупателю
        sendCustomerPaymentConfirmation(emailData),

        // Отправка email в магазин
        sendStoreOrderNotification(emailData),

        // Обновление количества товаров
        updateInventoryAfterPurchase(orderData.items),
      ]);

      // Обрабатываем результаты операций
      const [customerEmailResult, storeEmailResult, inventoryResult] =
        operations;

      // Обновляем статусы в базе данных
      if (
        customerEmailResult.status === "fulfilled" &&
        customerEmailResult.value
      ) {
        await markEmailAsSent(uid, "customer");
        console.log(`✅ Email покупателю отправлен для заказа ${uid}`);
      } else {
        console.error(
          `❌ Не удалось отправить email покупателю для заказа ${uid}:`,
          customerEmailResult.reason
        );
      }

      if (storeEmailResult.status === "fulfilled" && storeEmailResult.value) {
        await markEmailAsSent(uid, "store");
        console.log(`✅ Email в магазин отправлен для заказа ${uid}`);
      } else {
        console.error(
          `❌ Не удалось отправить email в магазин для заказа ${uid}:`,
          storeEmailResult.reason
        );
      }

      if (inventoryResult.status === "fulfilled" && inventoryResult.value) {
        await markInventoryAsUpdated(uid);
        console.log(`✅ Инвентарь обновлен для заказа ${uid}`);
      } else {
        console.error(
          `❌ Не удалось обновить инвентарь для заказа ${uid}:`,
          inventoryResult.reason
        );
      }

      console.log(`🎉 Заказ ${uid} успешно обработан`);
    } catch (error) {
      console.error(
        `💥 Ошибка при обработке успешной оплаты для UID ${uid}:`,
        error
      );
    }

    return NextResponse.redirect(new URL("/success", request.url));
  }

  console.log(`❌ Оплата не прошла. UID: ${uid}, Token: ${token}`);
  return NextResponse.redirect(new URL("/cart", request.url));
}
