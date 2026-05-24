import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Accessory from "@/entities/accessory/model/schema";

export const dynamic = 'force-dynamic';

// Разрешённые ключи фильтрации — защита от NoSQL injection
const ALLOWED_FILTERS = ["platform"];

export async function GET(request) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    // БАГ 3 FIX: только разрешённые ключи фильтрации (защита от NoSQL injection)
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (ALLOWED_FILTERS.includes(key) && value && value !== "all") {
        filters[key] = value;
      }
    }

    const total = await Accessory.countDocuments(filters);

    const accessories = await Accessory.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

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

// Создание аксессуаров только через /api/protected/accessories (требует авторизации)
