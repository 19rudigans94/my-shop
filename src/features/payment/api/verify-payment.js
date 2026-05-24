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
    `🔔 Callback от PayLink: status=${status}, uid=${uid}, token=${token}`
  );

  if (status === "successful") {
    console.log(`✅ Оплата успешна. UID: ${uid}`);

    try {
      let orderData = getStoredOrderData(uid);

      if (!orderData) {
        console.warn(`⚠️ Данные заказа ${uid} не в памяти, ищем в БД...`);

        const order = await getOrderByPaylinkProductId(uid);
        if (order) {
          console.log(`📦 Найден заказ в БД: ${order.orderId}`);

          await markOrderAsPaid(order.orderId, { uid, token });

          orderData = {
            customerInfo: order.customerInfo,
            items: order.items.map((item) => ({
              id: item.productId,
              title: item.name,
              price: item.price,
              quantity: item.quantity,
              platform: item.platform,
              condition: item.condition,
              type: item.productType,
            })),
            totalPrice: order.totalAmount,
            totalItems: order.totalItems,
          };
        } else {
          console.error(`❌ Заказ ${uid} не найден ни в памяти, ни в БД`);
          return NextResponse.redirect(new URL("/success", request.url));
        }
      } else {
        console.log(`📦 Данные заказа ${uid} найдены в памяти`);

        const order = await markOrderAsPaid(uid, { uid, token });
        if (!order) {
          console.error(`❌ Не удалось обновить заказ ${uid}`);
          return NextResponse.redirect(new URL("/success", request.url));
        }
      }

      // БАГ 1 FIX: сначала обновляем инвентарь и получаем credentials,
      // только потом отправляем email — иначе credentials ещё не деактивированы.
      const { allSuccessful: inventoryOk, digitalCredentials } =
        await updateInventoryAfterPurchase(orderData.items);

      if (inventoryOk) {
        await markInventoryAsUpdated(uid);
        console.log(`✅ Инвентарь обновлён для заказа ${uid}`);
      } else {
        console.error(`❌ Не удалось обновить инвентарь для заказа ${uid}`);
      }

      const emailData = {
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        totalAmount: orderData.totalPrice,
        orderId: uid,
      };

      const [customerEmailResult, storeEmailResult] = await Promise.allSettled([
        sendCustomerPaymentConfirmation(emailData, digitalCredentials),
        sendStoreOrderNotification(emailData),
      ]);

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

      console.log(`🎉 Заказ ${uid} успешно обработан`);
    } catch (error) {
      console.error(`💥 Ошибка при обработке оплаты ${uid}:`, error);
    }

    return NextResponse.redirect(new URL("/success", request.url));
  }

  console.log(`❌ Оплата не прошла. UID: ${uid}`);
  return NextResponse.redirect(new URL("/cart", request.url));
}
