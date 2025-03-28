import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET() {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const games = await Game.find({});
    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Ошибка при получении игр:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении игр из базы данных",
      },
      { status: 500 }
    );
  }
}
