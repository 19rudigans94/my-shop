import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import PhysicalDisk from "@/models/PhysicalDisk";

export async function GET(request, context) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Не указан slug игры" },
        { status: 400 }
      );
    }

    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    // Находим игру по slug
    const game = await Game.findOne({ slug });
    if (!game) {
      return NextResponse.json(
        { success: false, error: "Игра не найдена" },
        { status: 404 }
      );
    }

    // Получаем физические копии для этой игры
    const physicalDisks = await PhysicalDisk.find({ gameId: game._id });

    // Форматируем данные для ответа
    const prices = physicalDisks.map((disk) => ({
      platform: disk.platform,
      variants: disk.variants.map((variant) => ({
        condition: variant.condition,
        price: variant.price,
        stock: variant.stock,
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        prices,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Ошибка при получении цен:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при получении цен" },
      { status: 500 }
    );
  }
}
