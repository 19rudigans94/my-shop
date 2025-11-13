import { NextResponse } from "next/server";
import DigitalCopy from "@/models/DigitalCopy";
import { ensureDbConnection } from "@/app/utils/dbConnection";

export { createDigitalCopy as POST } from "../../controllers/digitalCopyController";

// Для быстрого добавления Detroit: Become Human PS5
export async function GET() {
  try {
    await ensureDbConnection();

    const detroitGameId = "68108e446add4283cdf87171"; // ID игры Detroit: Become Human из вашей базы

    // Проверяем, есть ли уже цифровая копия для PS5
    const existingCopy = await DigitalCopy.findOne({
      gameId: detroitGameId,
      platform: "PS5",
    });

    if (existingCopy) {
      return NextResponse.json({
        success: false,
        message: "Цифровая копия Detroit: Become Human PS5 уже существует",
        existing: existingCopy,
      });
    }

    // Создаем цифровую копию для Detroit: Become Human PS5
    const digitalCopy = new DigitalCopy({
      gameId: detroitGameId,
      platform: "PS5",
      price: 12, // Та же цена, что у PS4 версии
      isActive: true,
      credentials: [
        {
          login: "detroit_user1@psn.com",
          password: "DetroitPS5_2025",
          isActive: true,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedCopy = await digitalCopy.save();

    console.log(
      "✅ Автоматически добавлена цифровая копия Detroit: Become Human PS5:",
      savedCopy
    );

    return NextResponse.json({
      success: true,
      message:
        "Цифровая копия Detroit: Become Human PS5 автоматически добавлена",
      data: savedCopy,
    });
  } catch (error) {
    console.error("❌ Ошибка при автоматическом добавлении:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
