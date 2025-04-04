import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";
import { generateSlug } from "@/lib/utils";

// Получение списка аксессуаров
export async function GET() {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const accessories = await Accessory.find({});
    return NextResponse.json({
      success: true,
      accessories,
    });
  } catch (error) {
    console.error("Ошибка при получении аксессуаров:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "Ошибка при получении аксессуаров из базы данных",
      },
      { status: 500 }
    );
  }
}

// Создание нового аксессуара
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
      !data.platform ||
      !data.price ||
      !data.description ||
      !data.image ||
      typeof data.stock === "undefined"
    ) {
      throw new Error("Не все обязательные поля заполнены");
    }

    // Преобразуем stock в число, если оно передано как строка
    if (typeof data.stock === "string") {
      data.stock = parseInt(data.stock, 10);
    }

    // Генерируем слаг из названия
    let slug = generateSlug(data.title);

    // Проверяем, существует ли уже аксессуар с таким слагом
    let existingAccessory = await Accessory.findOne({ slug });
    let counter = 1;

    // Если слаг уже существует, добавляем к нему число
    while (existingAccessory) {
      slug = `${generateSlug(data.title)}-${counter}`;
      existingAccessory = await Accessory.findOne({ slug });
      counter++;
    }

    // Добавляем слаг в данные
    data.slug = slug;

    const accessory = await Accessory.create(data);

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error) {
    console.error("Ошибка при создании аксессуара:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при создании аксессуара",
      },
      { status: 500 }
    );
  }
}
