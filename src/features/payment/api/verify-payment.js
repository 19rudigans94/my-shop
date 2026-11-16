import { NextResponse } from "next/server";
import {
  claimOrderPayment,
  getOrderById,
  getOrderByPaylinkProductId,
  isPaylinkUidUsed,
  markEmailAsSent,
  markInventoryAsUpdated,
} from "@/entities/order/api";
import {
  sendCustomerPaymentConfirmation,
  sendStoreOrderNotification,
} from "@/shared/lib/email";
import { updateInventoryAfterPurchase } from "@/features/payment/api/inventory";
import { fetchPaylinkTransaction } from "@/features/payment/api/paylink-transaction";

const ORDER_ID_RE = /^ORD-[A-Z0-9]+-[A-Z0-9]+$/;

function redirect(request, path) {
  return NextResponse.redirect(new URL(path, request.url));
}

async function findOrder(orderParam, uid) {
  if (orderParam && ORDER_ID_RE.test(orderParam)) {
    return getOrderById(orderParam);
  }
  // Заказы, созданные до добавления ?order= в return_url
  if (uid) {
    return getOrderByPaylinkProductId(uid);
  }
  return null;
}

/**
 * Обработка возврата покупателя с PayLink.
 * Query-параметры (status, uid, token) не являются доказательством оплаты:
 * статус и сумма платежа всегда запрашиваются у PayLink напрямую.
 */
export async function handlePaymentVerification(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const orderParam = searchParams.get("order");

  console.log(
    `🔔 Возврат с PayLink: status=${status}, uid=${uid}, order=${orderParam}`
  );

  if (status !== "successful") {
    return redirect(request, "/cart");
  }

  try {
    const order = await findOrder(orderParam, uid);
    if (!order) {
      console.error(`❌ Заказ не найден: order=${orderParam}, uid=${uid}`);
      return redirect(request, "/cart?payment=not_found");
    }

    if (order.paymentStatus === "successful") {
      // Повторный возврат по уже оплаченному заказу
      return redirect(request, "/success");
    }
    if (order.paymentStatus !== "pending") {
      return redirect(request, "/cart?payment=failed");
    }

    const tx = await fetchPaylinkTransaction({ uid, token });
    if (!tx) {
      console.error(
        `❌ Не удалось подтвердить платеж у PayLink для заказа ${order.orderId} (uid=${uid}). Заказ остается pending.`
      );
      return redirect(request, "/cart?payment=unverified");
    }

    const expectedAmount = Math.round(order.totalAmount * 100);
    const problems = [];
    if (tx.status !== "successful") problems.push(`status=${tx.status}`);
    if (tx.amount !== expectedAmount) {
      problems.push(`amount=${tx.amount}, ожидалось ${expectedAmount}`);
    }
    if (tx.currency && tx.currency !== "KZT") problems.push(`currency=${tx.currency}`);
    if (process.env.NODE_ENV === "production" && tx.test) problems.push("test=true");

    if (problems.length > 0) {
      console.error(
        `❌ Платеж ${tx.uid} не подтверждает заказ ${order.orderId}: ${problems.join("; ")}`
      );
      return redirect(request, "/cart?payment=unverified");
    }

    if (await isPaylinkUidUsed(tx.uid)) {
      console.error(
        `❌ Транзакция ${tx.uid} уже использована для другого заказа (попытка для ${order.orderId})`
      );
      return redirect(request, "/cart?payment=unverified");
    }

    let paidOrder;
    try {
      paidOrder = await claimOrderPayment(order.orderId, { uid: tx.uid, token });
    } catch (error) {
      if (error?.code === 11000) {
        console.error(`❌ Транзакция ${tx.uid} уже привязана к другому заказу`);
        return redirect(request, "/cart?payment=unverified");
      }
      throw error;
    }

    if (!paidOrder) {
      // Параллельный запрос уже обработал этот заказ
      return redirect(request, "/success");
    }

    await fulfillOrder(paidOrder);
    return redirect(request, "/success");
  } catch (error) {
    console.error(`💥 Ошибка при обработке оплаты uid=${uid}:`, error);
    return redirect(request, "/cart?payment=error");
  }
}

/**
 * Списание остатков, выдача цифровых ключей и письма.
 * Данные берутся только из заказа в БД.
 */
async function fulfillOrder(order) {
  const orderId = order.orderId;

  const items = order.items.map((item) => ({
    id: item.productId,
    title: item.name,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    platform: item.platform,
    condition: item.condition,
    type: item.productType,
  }));

  const { allSuccessful: inventoryOk, digitalCredentials } =
    await updateInventoryAfterPurchase(items);

  if (inventoryOk) {
    await markInventoryAsUpdated(orderId);
    console.log(`✅ Инвентарь обновлён для заказа ${orderId}`);
  } else {
    console.error(`❌ Не удалось обновить инвентарь для заказа ${orderId}`);
  }

  const emailData = {
    customerInfo: order.customerInfo,
    items,
    totalAmount: order.totalAmount,
    orderId,
  };

  const [customerEmailResult, storeEmailResult] = await Promise.allSettled([
    sendCustomerPaymentConfirmation(emailData, digitalCredentials),
    sendStoreOrderNotification(emailData),
  ]);

  if (customerEmailResult.status === "fulfilled" && customerEmailResult.value) {
    await markEmailAsSent(orderId, "customer");
  } else {
    console.error(`❌ Не удалось отправить email покупателю для заказа ${orderId}:`, {
      status: customerEmailResult.status,
      reason: customerEmailResult.reason?.message || customerEmailResult.reason,
    });
  }

  if (storeEmailResult.status === "fulfilled" && storeEmailResult.value) {
    await markEmailAsSent(orderId, "store");
  } else {
    console.error(`❌ Не удалось отправить email в магазин для заказа ${orderId}:`, {
      status: storeEmailResult.status,
      reason: storeEmailResult.reason?.message || storeEmailResult.reason,
    });
  }

  console.log(`🎉 Заказ ${orderId} оплачен и обработан`);
}
