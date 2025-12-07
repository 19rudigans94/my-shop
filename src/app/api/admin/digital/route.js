import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    // Получаем все игры и наборы цифровых копий
    const games = await db.collection("games").find().toArray();
    const digitalCopySets = await db
      .collection("digitalcopies")
      .find()
      .toArray();

    // Формируем результат
    const results = [];

    for (const game of games) {
      // Находим все наборы цифровых копий для текущей игры
      const gameSets = digitalCopySets.filter(
        (set) => set.gameId.toString() === game._id.toString()
      );

      if (gameSets.length > 0) {
        // Преобразуем данные для каждого набора
        const setsData = gameSets.map((set) => ({
          _id: set._id,
          platform: set.platform,
          price: set.price,
          isActive: set.isActive,
          credentials: set.credentials || [],
          totalCredentials: set.credentials ? set.credentials.length : 0,
          activeCredentials: set.credentials
            ? set.credentials.filter((c) => c.isActive).length
            : 0,
        }));

        results.push({
          gameId: game._id,
          gameTitle: game.title,
          digitalSets: setsData,
          totalSets: setsData.length,
          activeSets: setsData.filter((set) => set.isActive).length,
        });
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

    // Проверяем тип контента и парсим данные соответственно
    const contentType = request.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      try {
        data = await request.json();
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
        return Response.json(
          {
            success: false,
            error: "Неверный формат JSON данных",
          },
          { status: 400 }
        );
      }
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      // Если пришел FormData, конвертируем в объект
      try {
        const formData = await request.formData();
        data = {};
        for (const [key, value] of formData.entries()) {
          // Пытаемся парсить числовые значения
          if (value === "null" || value === "undefined") {
            data[key] = undefined;
          } else if (!isNaN(value) && value !== "") {
            data[key] = Number(value);
          } else {
            data[key] = value;
          }
        }
      } catch (error) {
        console.error("Ошибка при парсинге FormData:", error);
        return Response.json(
          {
            success: false,
            error: "Ошибка при обработке данных формы",
          },
          { status: 400 }
        );
      }
    } else {
      // Пытаемся парсить как JSON по умолчанию
      try {
        const text = await request.text();
        if (!text || text.trim() === "") {
          return Response.json(
            {
              success: false,
              error: "Тело запроса пусто",
            },
            { status: 400 }
          );
        }
        data = JSON.parse(text);
      } catch (error) {
        console.error("Ошибка при парсинге тела запроса:", error);
        return Response.json(
          {
            success: false,
            error: "Неверный формат данных запроса",
          },
          { status: 400 }
        );
      }
    }
    const { operation, setId, gameId, platform, price, isActive, credential } =
      data;

    // Создание нового набора
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

      try {
        // Проверяем существование игры
        const game = await db.collection("games").findOne({
          _id: new ObjectId(gameId),
        });

        if (!game) {
          return Response.json(
            {
              success: false,
              error: "Игра не найдена",
            },
            { status: 404 }
          );
        }

        // Проверяем, нет ли уже набора для этой игры и платформы
        const existingSet = await db.collection("digitalcopies").findOne({
          gameId: new ObjectId(gameId),
          platform: platform,
        });

        if (existingSet) {
          return Response.json(
            {
              success: false,
              error: "Набор для этой игры и платформы уже существует",
            },
            { status: 400 }
          );
        }

        const newSet = {
          gameId: new ObjectId(gameId),
          platform,
          price: Number(price),
          isActive: true,
          credentials: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Если предоставлены учетные данные, добавляем их
        if (credential?.login && credential?.password) {
          newSet.credentials.push({
            _id: new ObjectId(),
            login: credential.login,
            password: credential.password,
            isActive: true,
            createdAt: new Date(),
          });
        }

        const result = await db.collection("digitalcopies").insertOne(newSet);

        if (!result.insertedId) {
          throw new Error("Не удалось создать набор");
        }

        return Response.json({
          success: true,
          message: "Набор цифровых копий успешно создан",
          setId: result.insertedId,
        });
      } catch (error) {
        console.error("Ошибка при создании набора:", error);
        return Response.json(
          {
            success: false,
            error: "Ошибка при создании набора: " + error.message,
          },
          { status: 500 }
        );
      }
    }

    // Обновление набора
    if (operation === "update_set") {
      if (!setId) {
        return Response.json(
          {
            success: false,
            error: "Не указан ID набора",
          },
          { status: 400 }
        );
      }

      const updateData = {
        updatedAt: new Date(),
      };

      if (platform !== undefined) updateData.platform = platform;
      if (price !== undefined) updateData.price = Number(price);
      if (isActive !== undefined) updateData.isActive = isActive;

      const result = await db
        .collection("digitalcopies")
        .updateOne({ _id: new ObjectId(setId) }, { $set: updateData });

      if (result.matchedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Набор не найден",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Набор успешно обновлен",
      });
    }

    // Добавление учетных данных
    if (operation === "add_credential") {
      try {
        console.log("Получены данные:", { setId, credential });

        if (!setId || !credential?.login || !credential?.password) {
          return Response.json(
            {
              success: false,
              error: "Не все обязательные поля заполнены",
            },
            { status: 400 }
          );
        }

        // Проверяем существование набора
        const existingSet = await db.collection("digitalcopies").findOne({
          _id: new ObjectId(setId),
        });

        if (!existingSet) {
          return Response.json(
            {
              success: false,
              error: "Набор не найден",
            },
            { status: 404 }
          );
        }

        // Проверяем уникальность логина в наборе
        if (
          existingSet.credentials?.some(
            (cred) => cred.login === credential.login
          )
        ) {
          return Response.json(
            {
              success: false,
              error: "Логин уже используется в этом наборе",
            },
            { status: 400 }
          );
        }

        const newCredential = {
          _id: new ObjectId(),
          login: credential.login,
          password: credential.password,
          isActive: true,
          createdAt: new Date(),
        };

        console.log("Добавляем учетные данные:", newCredential);

        const result = await db.collection("digitalcopies").updateOne(
          { _id: new ObjectId(setId) },
          {
            $push: { credentials: newCredential },
            $set: { updatedAt: new Date() },
          }
        );

        console.log("Результат обновления:", result);

        if (result.matchedCount === 0) {
          return Response.json(
            {
              success: false,
              error: "Набор не найден",
            },
            { status: 404 }
          );
        }

        if (result.modifiedCount === 0) {
          return Response.json(
            {
              success: false,
              error: "Не удалось добавить учетные данные",
            },
            { status: 500 }
          );
        }

        return Response.json({
          success: true,
          message: "Учетные данные успешно добавлены",
        });
      } catch (error) {
        console.error("Ошибка при добавлении учетных данных:", error);
        return Response.json(
          {
            success: false,
            error: "Ошибка при добавлении учетных данных: " + error.message,
          },
          { status: 500 }
        );
      }
    }

    // Обновление статуса учетных данных
    if (operation === "update_credential") {
      const { credentialId, credentialIsActive } = data;

      if (!setId || !credentialId || credentialIsActive === undefined) {
        return Response.json(
          {
            success: false,
            error: "Не все обязательные поля заполнены",
          },
          { status: 400 }
        );
      }

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
            error: "Набор или учетные данные не найдены",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Статус учетных данных обновлен",
      });
    }

    return Response.json(
      {
        success: false,
        error: "Неизвестная операция",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error);
    return Response.json(
      {
        success: false,
        error: "Ошибка при обработке запроса: " + error.message,
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
    const { operation, setId, credentialId } = data;

    // Удаление набора
    if (operation === "delete_set") {
      if (!setId) {
        return Response.json(
          {
            success: false,
            error: "Не указан ID набора",
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
            error: "Набор не найден",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Набор успешно удален",
      });
    }

    // Удаление учетных данных
    if (operation === "delete_credential") {
      if (!setId || !credentialId) {
        return Response.json(
          {
            success: false,
            error: "Не указаны необходимые ID",
          },
          { status: 400 }
        );
      }

      const result = await db.collection("digitalcopies").updateOne(
        { _id: new ObjectId(setId) },
        {
          $pull: {
            credentials: { _id: new ObjectId(credentialId) },
          },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.matchedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Набор не найден",
          },
          { status: 404 }
        );
      }

      if (result.modifiedCount === 0) {
        return Response.json(
          {
            success: false,
            error: "Учетные данные не найдены",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: "Учетные данные удалены",
      });
    }

    return Response.json(
      {
        success: false,
        error: "Неизвестная операция",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Ошибка при удалении:", error);
    return Response.json(
      {
        success: false,
        error: "Ошибка при удалении: " + error.message,
      },
      { status: 500 }
    );
  }
}
