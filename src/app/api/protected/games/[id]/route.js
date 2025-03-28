import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

// Получение конкретной игры
export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const game = await Game.findById(params.id);
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

// Обновление игры
export async function PUT(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const data = await request.json();
    const game = await Game.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

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
    console.error("Ошибка при обновлении игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при обновлении игры",
      },
      { status: 500 }
    );
  }
}

// Удаление игры
export async function DELETE(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const game = await Game.findByIdAndDelete(params.id);
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
      message: "Игра успешно удалена",
    });
  } catch (error) {
    console.error("Ошибка при удалении игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при удалении игры",
      },
      { status: 500 }
    );
  }
}
