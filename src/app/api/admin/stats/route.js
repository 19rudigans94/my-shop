import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Game from "@/entities/game/model/schema";
import Console from "@/entities/console/model/schema";
import Accessory from "@/entities/accessory/model/schema";

export const dynamic = 'force-dynamic';
import Order from "@/entities/order/model/schema";

export async function GET() {
  try {
    await connectDB();

    const [
      games,
      consoles,
      accessories,
      orders,
      pendingOrders,
      revenueResult,
    ] = await Promise.all([
      Game.countDocuments(),
      Console.countDocuments(),
      Accessory.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { paymentStatus: "successful" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        games,
        consoles,
        accessories,
        orders,
        pendingOrders,
        totalRevenue: revenueResult[0]?.total ?? 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
