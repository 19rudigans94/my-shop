import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import { generateSlug } from "@/lib/utils";

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

    const { id } = params;
    const data = await request.json();

    // Если изменилось название, обновляем слаг
    if (data.title) {
      let slug = generateSlug(data.title);

      // Проверяем, существует ли уже игра с таким слагом (кроме текущей)
      let existingGame = await Game.findOne({
        slug,
        _id: { $ne: id },
      });

      let counter = 1;
      while (existingGame) {
        slug = `${generateSlug(data.title)}-${counter}`;
        existingGame = await Game.findOne({
          slug,
          _id: { $ne: id },
        });
        counter++;
      }

      data.slug = slug;
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

    const game = await Game.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

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
