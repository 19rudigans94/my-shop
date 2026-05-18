import connectDB from "@/shared/lib/mongodb.js";
import Order from "../model/Order.js";

export async function createOrder(orderData) {
  await connectDB();
  const order = new Order(orderData);
  return await order.save();
}

export async function findOrderByUid(uid) {
  await connectDB();
  return await Order.findOne({ uid });
}

export async function updateOrderStatus(uid, status) {
  await connectDB();
  return await Order.findOneAndUpdate(
    { uid },
    { $set: { status, updatedAt: new Date() } },
    { new: true }
  );
}
