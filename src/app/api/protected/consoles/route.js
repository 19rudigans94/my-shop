import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Console from "@/models/Console";
import { generateSlug } from "@/lib/utils";

// Получение списка консолей
export async function GET() {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const consoles = await Console.find({});
    return NextResponse.json({
      success: true,
      consoles,
    });
  } catch (error) {
    console.error("Ошибка при получении консолей:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении консолей из базы данных",
      },
      { status: 500 }
    );
  }
}

// Создание новой консоли
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
      typeof data.state === "undefined" ||
      !data.price ||
      !data.description ||
      !data.image
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
    if (data.price < 0) {
      throw new Error("Цена не может быть отрицательной");
    }
    if (data.stock < 0) {
      throw new Error("Количество на складе не может быть отрицательным");
    }

    // Генерируем слаг из названия
    let slug = generateSlug(data.title);

    // Проверяем, существует ли уже консоль с таким слагом
    let existingConsole = await Console.findOne({ slug });
    let counter = 1;

    // Если слаг уже существует, добавляем к нему число
    while (existingConsole) {
      slug = `${generateSlug(data.title)}-${counter}`;
      existingConsole = await Console.findOne({ slug });
      counter++;
    }

    // Добавляем слаг в данные
    data.slug = slug;

    const console = await Console.create(data);

    return NextResponse.json({
      success: true,
      console,
    });
  } catch (error) {
    console.error("Ошибка при создании консоли:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при создании консоли",
      },
      { status: 500 }
    );
  }
}
