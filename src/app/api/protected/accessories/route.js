import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";

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
    const accessory = new Accessory(data);
    await accessory.save();

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
