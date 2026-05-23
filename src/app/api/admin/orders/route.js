import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Order from "@/entities/order/model/schema";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
