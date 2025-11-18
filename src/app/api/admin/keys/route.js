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

      // Группируем диски по платформам
      const platformsMap = new Map();

      for (const disk of gameDisks) {
        const platform = disk.platform || "PS5"; // Дефолтная платформа для старых записей
        const platformKey = platform;

        if (!platformsMap.has(platformKey)) {
          platformsMap.set(platformKey, {
            platform: platform,
            diskId: disk._id,
            variants: disk.variants || [],
          });
        }
      }

      // Если нет дисков для игры, создаем запись без платформы
      if (platformsMap.size === 0) {
        results.push({
          gameId: game._id,
          gameTitle: game.title,
          platform: null,
          diskId: null,
          newPrice: 0,
          usedPrice: 0,
          newStock: 0,
          usedStock: 0,
        });
      } else {
        // Добавляем результат для каждой платформы
        for (const [platformKey, diskData] of platformsMap.entries()) {
          const newVariant = diskData.variants.find(
            (v) => v.condition === "new"
          );
          const usedVariant = diskData.variants.find(
            (v) => v.condition === "used"
          );

          results.push({
            gameId: game._id,
            gameTitle: game.title,
            platform: diskData.platform,
            diskId: diskData.diskId,
            newPrice: newVariant ? newVariant.price : 0,
            usedPrice: usedVariant ? usedVariant.price : 0,
            newStock: newVariant ? newVariant.stock : 0,
            usedStock: usedVariant ? usedVariant.stock : 0,
          });
        }
      }
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
    const {
      diskId,
      condition,
      price,
      stock,
      gameId,
      newPrice,
      newStock,
      usedPrice,
      usedStock,
      platform,
    } = data;

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

      // Поддержка как старого формата (condition, price, stock), так и нового (newPrice, newStock, usedPrice, usedStock)
      const finalNewStock =
        newStock !== undefined
          ? parseInt(newStock) || 0
          : condition === "new"
          ? parseInt(stock) || 0
          : 0;
      const finalNewPrice =
        newPrice !== undefined
          ? parseFloat(newPrice) || 0
          : condition === "new"
          ? parseFloat(price) || 0
          : 0;
      const finalUsedStock =
        usedStock !== undefined
          ? parseInt(usedStock) || 0
          : condition === "used"
          ? parseInt(stock) || 0
          : 0;
      const finalUsedPrice =
        usedPrice !== undefined
          ? parseFloat(usedPrice) || 0
          : condition === "used"
          ? parseFloat(price) || 0
          : 0;

      // Валидация платформы
      if (!platform) {
        return Response.json(
          {
            success: false,
            error: "Не указана платформа для создания новой записи",
          },
          { status: 400 }
        );
      }

      // Создаем новую запись с указанными вариантами
      const newDisk = {
        gameId: new ObjectId(gameId),
        platform: platform,
        variants: [
          {
            condition: "new",
            stock: finalNewStock,
            price: finalNewPrice,
          },
          {
            condition: "used",
            stock: finalUsedStock,
            price: finalUsedPrice,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("physicaldisks").insertOne(newDisk);

      return Response.json({
        success: true,
        message: "Создана новая запись",
        diskId: result.insertedId,
      });
    }

    // Если diskId предоставлен, обновляем существующую запись
    // Поддержка обновления обоих вариантов одновременно
    if (
      newPrice !== undefined ||
      newStock !== undefined ||
      usedPrice !== undefined ||
      usedStock !== undefined
    ) {
      // Сначала получаем текущий документ, чтобы проверить наличие вариантов
      const currentDisk = await db
        .collection("physicaldisks")
        .findOne({ _id: new ObjectId(diskId) });

      if (!currentDisk) {
        return Response.json(
          {
            success: false,
            error: "Диск не найден",
          },
          { status: 404 }
        );
      }

      // Проверяем наличие вариантов и добавляем недостающие
      const hasNewVariant = currentDisk.variants?.some(
        (v) => v.condition === "new"
      );
      const hasUsedVariant = currentDisk.variants?.some(
        (v) => v.condition === "used"
      );

      // Если нужно обновить вариант "new", но его нет - добавляем
      if (
        (newPrice !== undefined || newStock !== undefined) &&
        !hasNewVariant
      ) {
        await db.collection("physicaldisks").updateOne(
          { _id: new ObjectId(diskId) },
          {
            $push: {
              variants: {
                condition: "new",
                stock: 0,
                price: 0,
              },
            },
          }
        );
      }

      // Если нужно обновить вариант "used", но его нет - добавляем
      if (
        (usedPrice !== undefined || usedStock !== undefined) &&
        !hasUsedVariant
      ) {
        await db.collection("physicaldisks").updateOne(
          { _id: new ObjectId(diskId) },
          {
            $push: {
              variants: {
                condition: "used",
                stock: 0,
                price: 0,
              },
            },
          }
        );
      }

      // Строим объект обновления с использованием arrayFilters
      const updateQuery = {};
      const arrayFilters = [];

      // Обновление данных для новых дисков
      if (newPrice !== undefined || newStock !== undefined) {
        if (newPrice !== undefined) {
          updateQuery["variants.$[newVariant].price"] = parseFloat(newPrice);
        }
        if (newStock !== undefined) {
          updateQuery["variants.$[newVariant].stock"] = parseInt(newStock);
        }
        arrayFilters.push({ "newVariant.condition": "new" });
      }

      // Обновление данных для б/у дисков
      if (usedPrice !== undefined || usedStock !== undefined) {
        if (usedPrice !== undefined) {
          updateQuery["variants.$[usedVariant].price"] = parseFloat(usedPrice);
        }
        if (usedStock !== undefined) {
          updateQuery["variants.$[usedVariant].stock"] = parseInt(usedStock);
        }
        arrayFilters.push({ "usedVariant.condition": "used" });
      }

      // Добавляем обновление времени изменения
      updateQuery["updatedAt"] = new Date();

      // Выполняем одно атомарное обновление
      const result = await db.collection("physicaldisks").updateOne(
        { _id: new ObjectId(diskId) },
        { $set: updateQuery },
        {
          arrayFilters: arrayFilters,
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

      // Логируем для отладки на продакшене
      console.log("Обновление диска:", {
        diskId: diskId.toString(),
        newPrice,
        newStock,
        usedPrice,
        usedStock,
        modifiedCount: result.modifiedCount,
      });

      return Response.json({
        success: true,
        message: "Данные успешно обновлены",
      });
    }

    // Старый формат: обновление одного варианта за раз (для обратной совместимости)
    if (condition && (price !== undefined || stock !== undefined)) {
      // Проверяем наличие варианта и добавляем, если его нет
      const currentDisk = await db
        .collection("physicaldisks")
        .findOne({ _id: new ObjectId(diskId) });

      if (!currentDisk) {
        return Response.json(
          {
            success: false,
            error: "Диск не найден",
          },
          { status: 404 }
        );
      }

      const hasVariant = currentDisk.variants?.some(
        (v) => v.condition === condition
      );

      // Если варианта нет - добавляем его
      if (!hasVariant) {
        await db.collection("physicaldisks").updateOne(
          { _id: new ObjectId(diskId) },
          {
            $push: {
              variants: {
                condition: condition,
                stock: 0,
                price: 0,
              },
            },
          }
        );
      }

      const updateQuery = {};
      if (price !== undefined) {
        updateQuery["variants.$[variant].price"] = parseFloat(price);
      }
      if (stock !== undefined) {
        updateQuery["variants.$[variant].stock"] = parseInt(stock);
      }
      updateQuery["updatedAt"] = new Date();

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

      // Логируем для отладки
      console.log("Обновление диска (старый формат):", {
        diskId: diskId.toString(),
        condition,
        price,
        stock,
        modifiedCount: result.modifiedCount,
      });

      return Response.json({
        success: true,
        message: "Данные успешно обновлены",
      });
    }

    return Response.json(
      {
        success: false,
        error: "Не указаны данные для обновления",
      },
      { status: 400 }
    );
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
