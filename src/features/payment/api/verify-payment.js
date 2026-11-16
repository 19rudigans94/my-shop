import { NextResponse } from "next/server";
import {
  claimPendingOrderForPayment,
  markEmailAsSent,
  markInventoryAsUpdated,
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
      // Заказ берём только из MongoDB и атомарно переводим pending -> paid,
      // чтобы повторный или параллельный callback не обработал его дважды.
      const { order, alreadyProcessed } = await claimPendingOrderForPayment(
        uid,
        { uid, token }
      );

      if (!order) {
        if (alreadyProcessed) {
          console.warn(`⚠️ Повторный callback для PayLink ID ${uid}. Игнорируем.`);
        } else {
          console.error(`❌ Заказ с PayLink ID ${uid} не найден в БД`);
        }
        return NextResponse.redirect(new URL("/success", request.url));
      }

      const orderId = order.orderId;
      console.log(`📦 Найден заказ в БД: ${orderId}`);

      const orderData = {
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

      // БАГ 1 FIX: сначала обновляем инвентарь и получаем credentials,
      // только потом отправляем email — иначе credentials ещё не деактивированы.
      const { allSuccessful: inventoryOk, digitalCredentials } =
        await updateInventoryAfterPurchase(orderData.items);

      if (inventoryOk) {
        await markInventoryAsUpdated(orderId);
        console.log(`✅ Инвентарь обновлён для заказа ${orderId}`);
      } else {
        console.error(`❌ Не удалось обновить инвентарь для заказа ${orderId}`);
      }

      const emailData = {
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        totalAmount: orderData.totalPrice,
        orderId,
      };

      const [customerEmailResult, storeEmailResult] = await Promise.allSettled([
        sendCustomerPaymentConfirmation(emailData, digitalCredentials),
        sendStoreOrderNotification(emailData),
      ]);

      if (customerEmailResult.status === "fulfilled" && customerEmailResult.value) {
        await markEmailAsSent(orderId, "customer");
        console.log(`✅ Email покупателю отправлен для заказа ${orderId}`);
      } else {
        console.error(`❌ Не удалось отправить email покупателю для заказа ${orderId}:`, {
          status: customerEmailResult.status,
          reason: customerEmailResult.reason?.message || customerEmailResult.reason,
        });
      }

      if (storeEmailResult.status === "fulfilled" && storeEmailResult.value) {
        await markEmailAsSent(orderId, "store");
        console.log(`✅ Email в магазин отправлен для заказа ${orderId}`);
      } else {
        console.error(`❌ Не удалось отправить email в магазин для заказа ${orderId}:`, {
          status: storeEmailResult.status,
          reason: storeEmailResult.reason?.message || storeEmailResult.reason,
        });
      }

      console.log(`🎉 Заказ ${orderId} успешно обработан`);
    } catch (error) {
      console.error(`💥 Ошибка при обработке оплаты ${uid}:`, error);
    }

    return NextResponse.redirect(new URL("/success", request.url));
  }

  console.log(`❌ Оплата не прошла. UID: ${uid}`);
  return NextResponse.redirect(new URL("/cart", request.url));
}
