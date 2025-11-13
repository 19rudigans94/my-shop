import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * Создать заказ
 */
export async function createOrder(orderData) {
  await connectDB();

  const order = new Order(orderData);
  return await order.save();
}

/**
 * Найти заказ по UID
 */
export async function findOrderByUid(uid) {
  await connectDB();
  return await Order.findOne({ uid });
}

/**
 * Обновить статус заказа
 */
export async function updateOrderStatus(uid, status) {
  await connectDB();
  return await Order.findOneAndUpdate(
    { uid },
    { $set: { status, updatedAt: new Date() } },
    { new: true }
  );
}
