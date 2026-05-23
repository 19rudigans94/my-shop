import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Order from "@/entities/order/model/schema";

const VALID_STATUSES = ["pending", "paid", "processing", "completed", "cancelled"];

export async function PATCH(request, { params }) {
  try {
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Недопустимый статус" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      params.id,
      { $set: { status, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Заказ не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
