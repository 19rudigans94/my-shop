import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

// Получение списка игр
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

// Создание новой игры
export async function POST(request) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const data = await request.json();
    const game = new Game(data);
    await game.save();

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при создании игры",
      },
      { status: 500 }
    );
  }
}
