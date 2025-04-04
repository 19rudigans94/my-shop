import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    // Получаем все игры
    const games = await db.collection("games").find({}).toArray();

    // Получаем все физические диски
    const physicalDisks = await db
      .collection("physicaldisks")
      .find({})
      .toArray();

    // Создаем объект для хранения результатов
    const results = [];

    // Проходим по каждой игре
    for (const game of games) {
      // Ищем все диски для текущей игры
      const gameDisks = physicalDisks.filter((disk) => {
        const diskGameId =
          disk.gameId instanceof ObjectId
            ? disk.gameId.toString()
            : disk.gameId;
        const gameId =
          game._id instanceof ObjectId ? game._id.toString() : game._id;
        return diskGameId === gameId;
      });

      // Подсчитываем количество новых и б/у дисков
      const newDisks = gameDisks.reduce((total, disk) => {
        const newVariant = disk.variants.find((v) => v.condition === "new");
        return total + (newVariant ? newVariant.stock : 0);
      }, 0);

      const usedDisks = gameDisks.reduce((total, disk) => {
        const usedVariant = disk.variants.find((v) => v.condition === "used");
        return total + (usedVariant ? usedVariant.stock : 0);
      }, 0);

      // Находим цены для новых и б/у дисков
      const newVariant =
        gameDisks.length > 0
          ? gameDisks[0].variants.find((v) => v.condition === "new")
          : null;
      const usedVariant =
        gameDisks.length > 0
          ? gameDisks[0].variants.find((v) => v.condition === "used")
          : null;

      // Добавляем результат в массив
      results.push({
        gameId: game._id,
        gameTitle: game.title,
        newDisks,
        usedDisks,
        totalDisks: newDisks + usedDisks,
        diskId: gameDisks.length > 0 ? gameDisks[0]._id : null,
        newPrice: newVariant ? newVariant.price : 0,
        usedPrice: usedVariant ? usedVariant.price : 0,
        newStock: newVariant ? newVariant.stock : 0,
        usedStock: usedVariant ? usedVariant.stock : 0,
      });
    }

    return Response.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    return Response.json(
      {
        success: false,
        error: "Ошибка при получении данных: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    const data = await request.json();
    const { diskId, condition, price, stock, gameId } = data;

    // Если diskId не предоставлен, создаем новую запись
    if (!diskId) {
      if (!gameId) {
        return Response.json(
          {
            success: false,
            error: "Не указан ID игры для создания новой записи",
          },
          { status: 400 }
        );
      }

      // Создаем новую запись с указанными вариантами
      const newDisk = {
        gameId: new ObjectId(gameId),
        platform: "PS5", // Можно сделать динамическим, если нужно
        variants: [
          {
            condition: "new",
            stock: condition === "new" ? parseInt(stock) || 0 : 0,
            price: condition === "new" ? parseFloat(price) || 0 : 0,
          },
          {
            condition: "used",
            stock: condition === "used" ? parseInt(stock) || 0 : 0,
            price: condition === "used" ? parseFloat(price) || 0 : 0,
          },
        ],
      };

      const result = await db.collection("physicaldisks").insertOne(newDisk);

      return Response.json({
        success: true,
        message: "Создана новая запись",
        diskId: result.insertedId,
      });
    }

    // Если diskId предоставлен, обновляем существующую запись
    const updateQuery = {};
    if (price !== undefined) {
      updateQuery["variants.$[variant].price"] = parseFloat(price);
    }
    if (stock !== undefined) {
      updateQuery["variants.$[variant].stock"] = parseInt(stock);
    }

    const result = await db.collection("physicaldisks").updateOne(
      { _id: new ObjectId(diskId) },
      { $set: updateQuery },
      {
        arrayFilters: [{ "variant.condition": condition }],
      }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        {
          success: false,
          error: "Диск не найден",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Данные успешно обновлены",
    });
  } catch (error) {
    console.error("Ошибка при обновлении данных:", error);
    return Response.json(
      {
        success: false,
        error: "Ошибка при обновлении данных: " + error.message,
      },
      { status: 500 }
    );
  }
}
