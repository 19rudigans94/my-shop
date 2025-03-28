import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";

// Получение конкретного аксессуара
export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const accessory = await Accessory.findById(params.id);
    if (!accessory) {
      return NextResponse.json(
        {
          success: false,
          error: "Аксессуар не найден",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error) {
    console.error("Ошибка при получении аксессуара:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении аксессуара",
      },
      { status: 500 }
    );
  }
}

// Обновление аксессуара
export async function PUT(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const data = await request.json();
    const accessory = await Accessory.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!accessory) {
      return NextResponse.json(
        {
          success: false,
          error: "Аксессуар не найден",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error) {
    console.error("Ошибка при обновлении аксессуара:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при обновлении аксессуара",
      },
      { status: 500 }
    );
  }
}

// Удаление аксессуара
export async function DELETE(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const accessory = await Accessory.findByIdAndDelete(params.id);
    if (!accessory) {
      return NextResponse.json(
        {
          success: false,
          error: "Аксессуар не найден",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Аксессуар успешно удален",
    });
  } catch (error) {
    console.error("Ошибка при удалении аксессуара:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при удалении аксессуара",
      },
      { status: 500 }
    );
  }
}
