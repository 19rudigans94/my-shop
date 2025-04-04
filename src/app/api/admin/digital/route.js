import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    // Получаем все игры
    const games = await db.collection("games").find({}).toArray();
    console.log("Найдено игр:", games.length);

    // Получаем все цифровые копии
    const digitalCopies = await db
      .collection("digitalcopies")
      .find({})
      .toArray();
    console.log("Найдено цифровых копий:", digitalCopies.length);

    // Создаем объект для хранения результатов
    const results = [];

    // Проходим по каждой игре
    for (const game of games) {
      // Ищем все цифровые копии для текущей игры
      const gameCopies = digitalCopies.filter((copy) => {
        const copyGameId =
          copy.gameId instanceof ObjectId
            ? copy.gameId.toString()
            : copy.gameId;
        const gameId =
          game._id instanceof ObjectId ? game._id.toString() : game._id;
        return copyGameId === gameId;
      });

      // Добавляем результат в массив
      results.push({
        gameId: game._id,
        gameTitle: game.title,
        copies: gameCopies.map((copy) => ({
          _id: copy._id,
          login: copy.login,
          password: copy.password,
          price: copy.price || 0,
          isActive: copy.isActive || false,
          platform: copy.platform || "PS5",
        })),
        totalCopies: gameCopies.length,
        activeCopies: gameCopies.filter((copy) => copy.isActive).length,
        totalPrice: gameCopies.reduce(
          (sum, copy) => sum + (copy.price || 0),
          0
        ),
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
    const { copyId, gameId, login, password, price, isActive, platform } = data;

    // Если copyId не предоставлен, создаем новую запись
    if (!copyId) {
      if (!gameId || !login || !password) {
        return Response.json(
          {
            success: false,
            error: "Не все обязательные поля заполнены",
          },
          { status: 400 }
        );
      }

      // Создаем новую цифровую копию
      const newCopy = {
        gameId: new ObjectId(gameId),
        login,
        password,
        price: price || 0,
        isActive: isActive ?? true,
        platform: platform || "PS5",
        createdAt: new Date(),
      };

      const result = await db.collection("digitalcopies").insertOne(newCopy);

      return Response.json({
        success: true,
        message: "Создана новая цифровая копия",
        copyId: result.insertedId,
      });
    }

    // Если copyId предоставлен, обновляем существующую запись
    const updateData = {};
    if (login !== undefined) updateData.login = login;
    if (password !== undefined) updateData.password = password;
    if (price !== undefined) updateData.price = price;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (platform !== undefined) updateData.platform = platform;
    updateData.updatedAt = new Date();

    const result = await db
      .collection("digitalcopies")
      .updateOne({ _id: new ObjectId(copyId) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return Response.json(
        {
          success: false,
          error: "Цифровая копия не найдена",
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

export async function DELETE(request) {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    const data = await request.json();
    const { copyId } = data;

    if (!copyId) {
      return Response.json(
        {
          success: false,
          error: "Не указан ID цифровой копии",
        },
        { status: 400 }
      );
    }

    const result = await db.collection("digitalcopies").deleteOne({
      _id: new ObjectId(copyId),
    });

    if (result.deletedCount === 0) {
      return Response.json(
        {
          success: false,
          error: "Цифровая копия не найдена",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Цифровая копия успешно удалена",
    });
  } catch (error) {
    console.error("Ошибка при удалении данных:", error);
    return Response.json(
      {
        success: false,
        error: "Ошибка при удалении данных: " + error.message,
      },
      { status: 500 }
    );
  }
}
