import connectDB from "@/shared/lib/db/mongodb";
import Order from "@/entities/order/model/schema";

/**
 * Создает новый заказ в базе данных.
 * Позиции и суммы должны быть уже пересчитаны на сервере (priceCart),
 * данные корзины от клиента сюда не передаются.
 * @param {Object} orderData - { customerInfo, items, totalPrice, totalItems }
 * @returns {Promise<string>} - ID созданного заказа
 */
export async function createOrder(orderData) {
  await connectDB();

  const orderId = generateOrderId();

  const order = new Order({
    orderId,
    customerInfo: orderData.customerInfo,
    items: orderData.items.map((item) => ({
      productId: item.id,
      productType: item.productType,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      platform: item.platform,
      condition: item.condition,
      total: item.price * item.quantity,
    })),
    totalAmount: orderData.totalPrice,
    totalItems: orderData.totalItems,
    status: "pending",
    paymentStatus: "pending",
    paymentData: {
      paymentMethod: "paylink",
    },
  });

  await order.save();
  console.log(`✅ Заказ ${orderId} создан на сумму ${orderData.totalPrice} ₸`);

  return orderId;
}

/**
 * Сохраняет ID продукта PayLink для заказа
 */
export async function setOrderPaylinkProductId(orderId, paylinkProductId) {
  await connectDB();
  await Order.updateOne(
    { orderId },
    {
      "paymentData.paylinkProductId": paylinkProductId,
      updatedAt: new Date(),
    }
  );
}

/**
 * Отменяет заказ, для которого не удалось создать ссылку на оплату
 */
export async function cancelPendingOrder(orderId) {
  try {
    await connectDB();
    await Order.updateOne(
      { orderId, paymentStatus: "pending" },
      { status: "cancelled", paymentStatus: "failed", updatedAt: new Date() }
    );
  } catch (error) {
    console.error(`Ошибка при отмене заказа ${orderId}:`, error);
  }
}

/**
 * Атомарно переводит заказ из pending в оплаченный.
 * Возвращает заказ только тому вызову, который сделал переход,
 * поэтому повторный или параллельный callback не выдаст ключи второй раз.
 * @returns {Promise<Object|null>}
 */
export async function claimOrderPayment(orderId, { uid, token }) {
  await connectDB();

  const now = new Date();
  const update = {
    status: "paid",
    paymentStatus: "successful",
    "paymentData.paylinkUid": uid,
    "paymentData.paymentMethod": "paylink",
    processedAt: now,
    updatedAt: now,
  };
  if (token) update["paymentData.paylinkToken"] = token;

  return Order.findOneAndUpdate(
    { orderId, paymentStatus: "pending" },
    { $set: update },
    { new: true }
  );
}

/**
 * Проверяет, не использована ли уже транзакция PayLink для другого заказа
 */
export async function isPaylinkUidUsed(uid) {
  await connectDB();
  const existing = await Order.exists({
    "paymentData.paylinkUid": uid,
    paymentStatus: "successful",
  });
  return Boolean(existing);
}

/**
 * Обновляет статус отправки email для заказа
 * @param {string} orderId - ID заказа
 * @param {string} emailType - Тип email ('customer' или 'store')
 * @returns {Promise<boolean>} - true если успешно
 */
export async function markEmailAsSent(orderId, emailType) {
  try {
    await connectDB();

    const updateField =
      emailType === "customer"
        ? "emailsSent.customerNotified"
        : "emailsSent.storeNotified";

    const result = await Order.updateOne(
      { orderId },
      {
        [updateField]: true,
        updatedAt: new Date(),
      }
    );

    if (result.matchedCount > 0) {
      console.log(
        `✅ Email ${emailType} для заказа ${orderId} помечен как отправленный`
      );
      return true;
    } else {
      console.error(`Заказ ${orderId} не найден при обновлении статуса email`);
      return false;
    }
  } catch (error) {
    console.error(
      `Ошибка при обновлении статуса email для заказа ${orderId}:`,
      error
    );
    return false;
  }
}

/**
 * Обновляет статус обновления инвентаря для заказа
 * @param {string} orderId - ID заказа
 * @returns {Promise<boolean>} - true если успешно
 */
export async function markInventoryAsUpdated(orderId) {
  try {
    await connectDB();

    const result = await Order.updateOne(
      { orderId },
      {
        inventoryUpdated: true,
        status: "processing",
        updatedAt: new Date(),
      }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Инвентарь для заказа ${orderId} помечен как обновленный`);
      return true;
    } else {
      console.error(
        `Заказ ${orderId} не найден при обновлении статуса инвентаря`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Ошибка при обновлении статуса инвентаря для заказа ${orderId}:`,
      error
    );
    return false;
  }
}

/**
 * Получает заказ по ID
 * @param {string} orderId - ID заказа
 * @returns {Promise<Object|null>} - Заказ или null
 */
export async function getOrderById(orderId) {
  try {
    await connectDB();

    const order = await Order.findOne({ orderId });
    return order;
  } catch (error) {
    console.error(`Ошибка при получении заказа ${orderId}:`, error);
    return null;
  }
}

/**
 * Получает заказ по PayLink product ID
 * @param {string} paylinkProductId - PayLink product ID
 * @returns {Promise<Object|null>} - Заказ или null
 */
export async function getOrderByPaylinkProductId(paylinkProductId) {
  try {
    await connectDB();

    const order = await Order.findOne({
      "paymentData.paylinkProductId": paylinkProductId,
    });
    console.log(
      `🔍 Поиск заказа по PayLink ID ${paylinkProductId}: ${
        order ? "найден" : "не найден"
      }`
    );
    return order;
  } catch (error) {
    console.error(
      `Ошибка при получении заказа по PayLink ID ${paylinkProductId}:`,
      error
    );
    return null;
  }
}

/**
 * Генерирует уникальный ID заказа
 * @returns {string} - Уникальный ID
 */
function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}
