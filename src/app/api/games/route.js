import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Game from "@/entities/game/model/schema";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const games = await Game.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, games });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка при получении списка игр!" },
      { status: 500 }
    );
  }
}

// Создание игр только через /api/protected/games (требует авторизации)
