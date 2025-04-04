import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    console.log("Получен slug:", slug);

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Идентификатор игры не указан" },
        { status: 400 }
      );
    }

    // Подключаемся к базе данных
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    // Получаем информацию об игре по slug
    const game = await db.collection("games").findOne({ slug });
    console.log("Найдена игра:", game);

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Игра не найдена" },
        { status: 404 }
      );
    }

    // Получаем цифровые копии для этой игры
    const copies = await db
      .collection("digitalcopies")
      .find({
        gameId: game._id.toString(),
        isActive: true, // Ищем только активные копии
      })
      .toArray();

    console.log("Найдены активные цифровые копии:", copies);

    // Если есть хотя бы одна копия, берем её цену и платформу
    const price = copies.length > 0 ? copies[0].price : 0;
    const platform =
      copies.length > 0 ? copies[0].platform : game.platform || "PS5";

    const response = {
      success: true,
      hasDigitalCopies: copies.length > 0,
      price: price,
      platform: platform,
      totalCopies: copies.length,
      copies: copies.map((copy) => ({
        _id: copy._id.toString(),
        price: copy.price,
        platform: copy.platform,
        isActive: copy.isActive,
      })),
    };

    console.log("Отправляем ответ:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка при получении цифровых копий:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера: " + error.message },
      { status: 500 }
    );
  }
}
