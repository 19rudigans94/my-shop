import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Accessory from "@/entities/accessory/model/schema";
import { generateUniqueSlug } from "@/shared/lib/slug";

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

    data.slug = await generateUniqueSlug(data.title, Accessory);

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
