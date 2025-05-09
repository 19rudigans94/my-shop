import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";
import { generateSlug } from "@/lib/utils";

export async function GET(request) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    // Формируем объект фильтров
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page" && key !== "limit" && value && value !== "all") {
        filters[key] = value;
      }
    }

    // console.log("Фильтры:", filters);

    // Получаем общее количество записей
    const total = await Accessory.countDocuments(filters);
    // console.log("Всего записей:", total);

    // Получаем отфильтрованные аксессуары с пагинацией
    const accessories = await Accessory.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Преобразуем в простые объекты

    // console.log("Найдено аксессуаров:", accessories.length);

    if (!accessories) {
      throw new Error("Аксессуары не найдены");
    }

    return NextResponse.json({
      success: true,
      accessories: accessories || [],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Ошибка при получении списка аксессуаров:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении списка аксессуаров",
      },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json(
      {
        success: true,
        accessory,
      },
      { status: 201 }
    );
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
