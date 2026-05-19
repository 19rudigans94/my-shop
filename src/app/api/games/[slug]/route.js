import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const { slug } = await params;
    if (!slug) {
      throw new Error("Не указан slug игры");
    }

    const game = await Game.findOne({ slug }).lean();

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          error: "Игра не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Ошибка при получении игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении игры",
      },
      { status: 500 }
    );
  }
}
