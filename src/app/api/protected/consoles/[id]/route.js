import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Console from "@/models/Console";
import { generateSlug } from "@/lib/utils";

// Получение конкретной консоли
export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const console = await Console.findById(params.id);
    if (!console) {
      return NextResponse.json(
        {
          success: false,
          error: "Консоль не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      console,
    });
  } catch (error) {
    console.error("Ошибка при получении консоли:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении консоли",
      },
      { status: 500 }
    );
  }
}

// Обновление консоли
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

      // Проверяем, существует ли уже консоль с таким слагом (кроме текущей)
      let existingConsole = await Console.findOne({
        slug,
        _id: { $ne: id },
      });

      let counter = 1;
      while (existingConsole) {
        slug = `${generateSlug(data.title)}-${counter}`;
        existingConsole = await Console.findOne({
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

    const console = await Console.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!console) {
      return NextResponse.json(
        {
          success: false,
          error: "Консоль не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      console,
    });
  } catch (error) {
    console.error("Ошибка при обновлении консоли:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при обновлении консоли",
      },
      { status: 500 }
    );
  }
}

// Удаление консоли
export async function DELETE(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const console = await Console.findByIdAndDelete(params.id);
    if (!console) {
      return NextResponse.json(
        {
          success: false,
          error: "Консоль не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Консоль успешно удалена",
    });
  } catch (error) {
    console.error("Ошибка при удалении консоли:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при удалении консоли",
      },
      { status: 500 }
    );
  }
}
