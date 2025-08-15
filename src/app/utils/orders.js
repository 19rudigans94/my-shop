import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * Создает новый заказ в базе данных
 * @param {Object} orderData - Данные заказа
 * @returns {Promise<string>} - ID созданного заказа
 */
export async function createOrder(orderData) {
  try {
    await connectDB();

    const orderId = generateOrderId();

    const order = new Order({
      orderId,
      customerInfo: orderData.customerInfo,
      items: orderData.items.map((item) => ({
        productId: item.id,
        productType: item.type,
        name: item.name || item.title,
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
    });

    await order.save();
    console.log(`✅ Заказ ${orderId} создан в базе данных`);

    return orderId;
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    throw error;
  }
}

/**
 * Обновляет статус заказа после успешной оплаты
 * @param {string} orderId - ID заказа
 * @param {Object} paymentData - Данные о платеже
 * @returns {Promise<Object|null>} - Обновленный заказ или null
 */
export async function markOrderAsPaid(orderId, paymentData = {}) {
  try {
    await connectDB();

    const order = await Order.findOne({ orderId });
    if (!order) {
      console.error(`Заказ ${orderId} не найден`);
      return null;
    }

    order.status = "paid";
    order.paymentStatus = "successful";
    order.paymentData = {
      paylinkUid: paymentData.uid,
      paylinkToken: paymentData.token,
      paymentMethod: "paylink",
    };
    order.processedAt = new Date();
    order.updatedAt = new Date();

    await order.save();
    console.log(`✅ Заказ ${orderId} помечен как оплаченный`);

    return order;
  } catch (error) {
    console.error(`Ошибка при обновлении заказа ${orderId}:`, error);
    return null;
  }
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
 * Сохраняет данные заказа во временном хранилище для последующей обработки
 * @param {string} orderId - ID заказа
 * @param {Object} orderData - Данные заказа
 */
export function storeOrderDataForProcessing(orderId, orderData) {
  // Используем глобальную переменную для временного хранения
  // В продакшене лучше использовать Redis или другое внешнее хранилище
  if (!global.pendingOrders) {
    global.pendingOrders = new Map();
  }

  global.pendingOrders.set(orderId, {
    ...orderData,
    timestamp: Date.now(),
  });

  console.log(`💾 Данные заказа ${orderId} сохранены для обработки`);

  // Очищаем старые данные (старше 1 часа)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, data] of global.pendingOrders.entries()) {
    if (data.timestamp < oneHourAgo) {
      global.pendingOrders.delete(id);
      console.log(`🧹 Удалены устаревшие данные заказа ${id}`);
    }
  }
}

/**
 * Получает сохраненные данные заказа
 * @param {string} orderId - ID заказа
 * @returns {Object|null} - Данные заказа или null
 */
export function getStoredOrderData(orderId) {
  if (!global.pendingOrders) {
    return null;
  }

  const orderData = global.pendingOrders.get(orderId);
  if (orderData) {
    // Удаляем данные после получения
    global.pendingOrders.delete(orderId);
    console.log(`📦 Получены данные заказа ${orderId} из временного хранилища`);
  }

  return orderData || null;
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
