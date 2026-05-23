import { NextResponse } from "next/server";
import {
  markOrderAsPaid,
  getStoredOrderData,
  markEmailAsSent,
  markInventoryAsUpdated,
  getOrderByPaylinkProductId,
} from "@/entities/order/api";
import {
  sendCustomerPaymentConfirmation,
  sendStoreOrderNotification,
} from "@/shared/lib/email";
import { updateInventoryAfterPurchase } from "@/features/payment/api/inventory";

export async function handlePaymentVerification(request) {
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
      let orderData = getStoredOrderData(uid);

      if (!orderData) {
        console.warn(
          `⚠️ Данные заказа для UID ${uid} не найдены в памяти, ищем в БД...`
        );

        const order = await getOrderByPaylinkProductId(uid);
        if (order) {
          console.log(`📦 Найден заказ в БД: ${order.orderId}`);

          await markOrderAsPaid(order.orderId, { uid, token });

          orderData = {
            customerInfo: order.customerInfo,
            items: order.items.map((item) => ({
              title: item.name,
              price: item.price,
              quantity: item.quantity,
              platform: item.platform,
              condition: item.condition,
            })),
            totalPrice: order.totalAmount,
            totalItems: order.totalItems,
          };
        } else {
          console.error(`❌ Заказ ${uid} не найден ни в памяти, ни в БД`);
          return NextResponse.redirect(new URL("/success", request.url));
        }
      } else {
        console.log(`📦 Найдены данные заказа в памяти для UID ${uid}`);

        const order = await markOrderAsPaid(uid, { uid, token });
        if (!order) {
          console.error(`❌ Не удалось обновить заказ ${uid}`);
          return NextResponse.redirect(new URL("/success", request.url));
        }
      }

      const emailData = {
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        totalAmount: orderData.totalPrice,
        orderId: uid,
      };

      const operations = await Promise.allSettled([
        sendCustomerPaymentConfirmation(emailData),
        sendStoreOrderNotification(emailData),
        updateInventoryAfterPurchase(orderData.items),
      ]);

      const [customerEmailResult, storeEmailResult, inventoryResult] = operations;

      if (customerEmailResult.status === "fulfilled" && customerEmailResult.value) {
        await markEmailAsSent(uid, "customer");
        console.log(`✅ Email покупателю отправлен для заказа ${uid}`);
      } else {
        console.error(`❌ Не удалось отправить email покупателю для заказа ${uid}:`, {
          status: customerEmailResult.status,
          reason: customerEmailResult.reason?.message || customerEmailResult.reason,
        });
      }

      if (storeEmailResult.status === "fulfilled" && storeEmailResult.value) {
        await markEmailAsSent(uid, "store");
        console.log(`✅ Email в магазин отправлен для заказа ${uid}`);
      } else {
        console.error(`❌ Не удалось отправить email в магазин для заказа ${uid}:`, {
          status: storeEmailResult.status,
          reason: storeEmailResult.reason?.message || storeEmailResult.reason,
        });
      }

      if (inventoryResult.status === "fulfilled" && inventoryResult.value) {
        await markInventoryAsUpdated(uid);
        console.log(`✅ Инвентарь обновлен для заказа ${uid}`);
      } else {
        console.error(`❌ Не удалось обновить инвентарь для заказа ${uid}:`, inventoryResult.reason);
      }

      console.log(`🎉 Заказ ${uid} успешно обработан`);
    } catch (error) {
      console.error(`💥 Ошибка при обработке успешной оплаты для UID ${uid}:`, error);
    }

    return NextResponse.redirect(new URL("/success", request.url));
  }

  console.log(`❌ Оплата не прошла. UID: ${uid}, Token: ${token}`);
  return NextResponse.redirect(new URL("/cart", request.url));
}
