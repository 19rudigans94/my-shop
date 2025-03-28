import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Console from "@/models/Console";

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

    const data = await request.json();
    const console = await Console.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

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
