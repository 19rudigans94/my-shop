import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    console.log("Получен slug:", slug);

    if (!slug) {
      return NextResponse.json(
        { error: "Идентификатор игры не указан" },
        { status: 400 }
      );
    }

    // Подключаемся к базе данных
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    // Получаем информацию об игре по slug
    const game = await db.collection("games").findOne({ slug });
    console.log("Найдена игра:", game._id);

    if (!game) {
      return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
    }

    // Получаем активные цифровые копии для этой игры
    const digitalCopies = await db
      .collection("digitalcopies")
      .find({
        gameId: game._id,
        isActive: true, // ищем только активные наборы
      })
      .toArray();

    // Форматируем данные о цифровых копиях для клиента
    // Внимание: мы НЕ отправляем учетные данные, только информацию о наличии копий
    const copiesFormatted = digitalCopies.map((copy) => ({
      _id: copy._id.toString(),
      price: copy.price,
      platform: copy.platform,
      // Посчитаем количество активных учетных данных
      totalAvailable: Array.isArray(copy.credentials)
        ? copy.credentials.filter((cred) => cred.isActive).length
        : 0,
    }));

    console.log("Отправляем ответ:", copiesFormatted);
    return NextResponse.json({ copies: copiesFormatted });
  } catch (error) {
    console.error("Ошибка при получении цифровых копий:", error);
    return NextResponse.json(
      { error: "Ошибка сервера: " + error.message },
      { status: 500 }
    );
  }
}
