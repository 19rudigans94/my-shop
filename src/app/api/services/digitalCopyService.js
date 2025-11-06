import connectDB from "@/lib/mongodb";
import DigitalCopy from "@/models/DigitalCopy";

/**
 * Получить цифровые копии игры по slug
 */
export async function getDigitalCopiesByGameSlug(slug) {
  const mongoose = await connectDB();
  const db = mongoose.connection.db;

  // Получаем информацию об игре по slug
  const game = await db.collection("games").findOne({ slug });

  if (!game) {
    throw new Error("Игра не найдена");
  }

  // Получаем активные цифровые копии для этой игры
  const digitalCopies = await db
    .collection("digitalcopies")
    .find({
      gameId: game._id,
      isActive: true,
    })
    .toArray();

  // Форматируем данные о цифровых копиях
  const copiesFormatted = digitalCopies.map((copy) => ({
    _id: copy._id.toString(),
    price: copy.price,
    platform: copy.platform,
    totalAvailable: Array.isArray(copy.credentials)
      ? copy.credentials.filter((cred) => cred.isActive).length
      : 0,
  }));

  return copiesFormatted;
}

/**
 * Создать цифровую копию
 */
export async function createDigitalCopy(data) {
  const { gameId, platform, price, credentials } = data;

  if (!gameId || !platform || price === undefined || !credentials) {
    throw new Error("Не все обязательные поля заполнены");
  }

  const digitalCopy = new DigitalCopy({
    gameId,
    platform,
    price,
    isActive: true,
    credentials: credentials.map((cred) => ({
      login: cred.login,
      password: cred.password,
      isActive: true,
      createdAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return await digitalCopy.save();
}
