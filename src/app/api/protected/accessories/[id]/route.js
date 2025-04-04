import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";
import { generateSlug } from "@/lib/utils";

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

    const { id } = params;
    const data = await request.json();

    // Если изменилось название, обновляем слаг
    if (data.title) {
      let slug = generateSlug(data.title);

      // Проверяем, существует ли уже аксессуар с таким слагом (кроме текущего)
      let existingAccessory = await Accessory.findOne({
        slug,
        _id: { $ne: id },
      });

      let counter = 1;
      while (existingAccessory) {
        slug = `${generateSlug(data.title)}-${counter}`;
        existingAccessory = await Accessory.findOne({
          slug,
          _id: { $ne: id },
        });
        counter++;
      }

      data.slug = slug;
    }

    // Преобразуем stock в число, если оно передано как строка
    if (typeof data.stock === "string") {
      data.stock = parseInt(data.stock, 10);
    }

    const accessory = await Accessory.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!accessory) {
      return NextResponse.json(
        { success: false, error: "Аксессуар не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, accessory });
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
