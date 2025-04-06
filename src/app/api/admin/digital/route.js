import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    // Получаем все игры
    const games = await db.collection("games").find({}).toArray();
    console.log("Найдено игр:", games.length);

    // Получаем все цифровые копии (наборы)
    const digitalCopySets = await db
      .collection("digitalcopies")
      .find({})
      .toArray();
    console.log("Найдено наборов цифровых копий:", digitalCopySets.length);

    // Создаем объект для хранения результатов
    const results = [];

    // Проходим по каждой игре
    for (const game of games) {
      // Находим все наборы цифровых копий для текущей игры
      const gameDigitalSets = digitalCopySets.filter((set) => {
        const setGameId =
          set.gameId instanceof ObjectId ? set.gameId.toString() : set.gameId;
        const gameId =
          game._id instanceof ObjectId ? game._id.toString() : game._id;
        return setGameId === gameId;
      });

      // Преобразуем данные для каждого набора
      const gameSetsData = gameDigitalSets.map((set) => {
        // Считаем активные учетные данные
        const credentials = Array.isArray(set.credentials)
          ? set.credentials
          : [];
        const activeCredentials = credentials.filter((cred) => cred.isActive);

        return {
          _id: set._id,
          platform: set.platform || "PS5",
          price: set.price || 0,
          isActive: set.isActive || false,
          totalCredentials: credentials.length,
          activeCredentials: activeCredentials.length,
          credentials: credentials.map((cred) => ({
            login: cred.login,
            password: cred.password,
            isActive: cred.isActive,
            createdAt: cred.createdAt,
          })),
        };
      });

      // Добавляем результат в массив
      results.push({
        gameId: game._id,
        gameTitle: game.title,
        digitalSets: gameSetsData,
        totalSets: gameSetsData.length,
        activeSets: gameSetsData.filter((set) => set.isActive).length,
        totalCredentials: gameSetsData.reduce(
          (sum, set) => sum + set.totalCredentials,
          0
        ),
        activeCredentials: gameSetsData.reduce(
          (sum, set) => sum + set.activeCredentials,
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
    const {
      operation, // тип операции: 'create_set', 'update_set', 'add_credential', 'update_credential'
      setId, // ID набора цифровых копий
      gameId, // ID игры
      platform, // Платформа
      price, // Цена
      isActive, // Активность набора
      credential, // информация о новых учетных данных {login, password}
      credentialId, // ID учетных данных для обновления
      credentialIsActive, // Активность учетных данных
    } = data;

    // Создание нового набора цифровых копий
    if (operation === "create_set") {
      if (!gameId || !platform || price === undefined) {
        return Response.json(
          {
            success: false,
            error: "Не все обязательные поля заполнены",
          },
          { status: 400 }
        );
      }

      // Создаем новый набор цифровых копий
      const newDigitalSet = {
        gameId: new ObjectId(gameId),
        platform,
        price,
        isActive: isActive !== undefined ? isActive : true,
        credentials: [], // начинаем с пустого массива учетных данных
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Если предоставлены учетные данные, добавляем их
      if (credential && credential.login && credential.password) {
        newDigitalSet.credentials.push({
          login: credential.login,
          password: credential.password,
          isActive: true,
          createdAt: new Date(),
        });
      }

      const result = await db
        .collection("digitalcopies")
        .insertOne(newDigitalSet);

      return Response.json({
        success: true,
        message: "Создан новый набор цифровых копий",
        setId: result.insertedId,
      });
    }

    // Обновление набора цифровых копий
    else if (operation === "update_set") {
      if (!setId) {
        return Response.json(
          {
            success: false,
            error: "Не указан ID набора цифровых копий",
          },
          { status: 400 }
        );
      }

      const updateData = {};
      if (platform !== undefined) updateData.platform = platform;
      if (price !== undefined) updateData.price = price;
      if (isActive !== undefined) updateData.isActive = isActive;
      updateData.updatedAt = new Date();

      const result = await db
        .collection("digitalcopies")
        .updateOne({ _id: new ObjectId(setId) }, { $set: updateData });

      if (result.matchedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Набор цифровых копий не найден",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Набор цифровых копий успешно обновлен",
      });
    }

    // Добавление новых учетных данных в набор
    else if (operation === "add_credential") {
      if (!setId || !credential || !credential.login || !credential.password) {
        return Response.json(
          {
            success: false,
            error: "Не все обязательные поля заполнены",
          },
          { status: 400 }
        );
      }

      // Создаем новые учетные данные
      const newCredential = {
        login: credential.login,
        password: credential.password,
        isActive: credentialIsActive !== undefined ? credentialIsActive : true,
        createdAt: new Date(),
      };

      // Добавляем учетные данные в массив
      const result = await db.collection("digitalcopies").updateOne(
        { _id: new ObjectId(setId) },
        {
          $push: { credentials: newCredential },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.matchedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Набор цифровых копий не найден",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Учетные данные успешно добавлены",
      });
    }

    // Обновление статуса учетных данных
    else if (operation === "update_credential") {
      if (!setId || !credentialId || credentialIsActive === undefined) {
        return Response.json(
          {
            success: false,
            error: "Не все обязательные поля заполнены",
          },
          { status: 400 }
        );
      }

      // Обновляем статус учетных данных по индексу
      const result = await db.collection("digitalcopies").updateOne(
        {
          _id: new ObjectId(setId),
          "credentials._id": new ObjectId(credentialId),
        },
        {
          $set: {
            "credentials.$.isActive": credentialIsActive,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Набор цифровых копий или учетные данные не найдены",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Статус учетных данных успешно обновлен",
      });
    }

    // Неизвестная операция
    else {
      return Response.json(
        {
          success: false,
          error: "Неизвестная операция",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Ошибка при обработке данных:", error);
    return Response.json(
      {
        success: false,
        error: "Ошибка при обработке данных: " + error.message,
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
    const {
      operation, // тип операции: 'delete_set' или 'delete_credential'
      setId, // ID набора цифровых копий
      credentialId, // ID учетных данных для удаления
    } = data;

    // Удаление всего набора цифровых копий
    if (operation === "delete_set") {
      if (!setId) {
        return Response.json(
          {
            success: false,
            error: "Не указан ID набора цифровых копий",
          },
          { status: 400 }
        );
      }

      const result = await db.collection("digitalcopies").deleteOne({
        _id: new ObjectId(setId),
      });

      if (result.deletedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Набор цифровых копий не найден",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Набор цифровых копий успешно удален",
      });
    }
    // Удаление конкретных учетных данных из набора
    else if (operation === "delete_credential") {
      if (!setId || !credentialId) {
        return Response.json(
          {
            success: false,
            error: "Не указан ID набора или ID учетных данных",
          },
          { status: 400 }
        );
      }

      // Удаляем учетные данные из массива
      const result = await db.collection("digitalcopies").updateOne(
        { _id: new ObjectId(setId) },
        {
          $pull: { credentials: { _id: new ObjectId(credentialId) } },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.matchedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Набор цифровых копий не найден",
          },
          { status: 404 }
        );
      }

      if (result.modifiedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Учетные данные не найдены или уже удалены",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Учетные данные успешно удалены из набора",
      });
    }
    // Неизвестная операция
    else {
      return Response.json(
        {
          success: false,
          error: "Неизвестная операция удаления",
        },
        { status: 400 }
      );
    }
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
