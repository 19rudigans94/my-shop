import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import { generateSlug } from "@/lib/utils";

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

    // Проверяем обязательные поля
    if (
      !data.title ||
      !data.platforms ||
      !data.description ||
      !data.image ||
      !data.releaseDate ||
      !data.publisher
    ) {
      throw new Error("Не все обязательные поля заполнены");
    }

    // Проверяем и преобразуем числовые поля
    if (typeof data.price === "string") {
      data.price = parseFloat(data.price);
    }
    if (typeof data.stock === "string") {
      data.stock = parseInt(data.stock, 10);
    }

    // Проверяем на отрицательные значения
    if (data.price !== undefined && data.price < 0) {
      throw new Error("Цена не может быть отрицательной");
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error("Количество на складе не может быть отрицательным");
    }

    // Генерируем слаг из названия
    let slug = generateSlug(data.title);

    // Проверяем, существует ли уже игра с таким слагом
    let existingGame = await Game.findOne({ slug });
    let counter = 1;

    // Если слаг уже существует, добавляем к нему число
    while (existingGame) {
      slug = `${generateSlug(data.title)}-${counter}`;
      existingGame = await Game.findOne({ slug });
      counter++;
    }

    // Добавляем слаг в данные
    data.slug = slug;

    const game = await Game.create(data);

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
