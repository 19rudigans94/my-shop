import connectDB from "@/shared/lib/mongodb.js";
import DigitalCopy from "../model/DigitalCopy.js";

export async function getDigitalCopiesByGameSlug(slug) {
  const mongoose = await connectDB();
  const db = mongoose.connection.db;

  const game = await db.collection("games").findOne({ slug });

  if (!game) {
    throw new Error("Игра не найдена");
  }

  const digitalCopies = await db
    .collection("digitalcopies")
    .find({
      gameId: game._id,
      isActive: true,
    })
    .toArray();

  return digitalCopies.map((copy) => ({
    _id: copy._id.toString(),
    price: copy.price,
    platform: copy.platform,
    totalAvailable: Array.isArray(copy.credentials)
      ? copy.credentials.filter((cred) => cred.isActive).length
      : 0,
  }));
}

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
