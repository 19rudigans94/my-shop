import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Console from "@/models/Console";

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
    const console = new Console(data);
    await console.save();

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
