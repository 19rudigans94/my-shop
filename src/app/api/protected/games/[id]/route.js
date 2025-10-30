import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import { generateSlug } from "@/lib/utils";

/**
 * @swagger
 * /api/protected/games/{id}:
 *   get:
 *     summary: Получить игру по ID (защищенный)
 *     description: Получает детальную информацию об игре по её ID. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID игры
 *     responses:
 *       200:
 *         description: Игра успешно найдена
 *       404:
 *         description: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */
// Получение конкретной игры
export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const game = await Game.findById(params.id);
    if (!game) {
      return NextResponse.json(
        {
          success: false,
          error: "Игра не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Ошибка при получении игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении игры",
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/protected/games/{id}:
 *   put:
 *     summary: Обновить игру (защищенный)
 *     description: Обновляет существующую игру. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Игра успешно обновлена
 *       404:
 *         description: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */
// Обновление игры
export async function PUT(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const { id } = params;
    const data = await request.json();

    // Если изменилось название, обновляем слаг
    if (data.title) {
      let slug = generateSlug(data.title);

      // Проверяем, существует ли уже игра с таким слагом (кроме текущей)
      let existingGame = await Game.findOne({
        slug,
        _id: { $ne: id },
      });

      let counter = 1;
      while (existingGame) {
        slug = `${generateSlug(data.title)}-${counter}`;
        existingGame = await Game.findOne({
          slug,
          _id: { $ne: id },
        });
        counter++;
      }

      data.slug = slug;
    }

    // Проверяем и преобразуем числовые поля
    if (typeof data.price === "string") {
      data.price = parseFloat(data.price);
    }
    if (typeof data.stock === "string") {
      data.stock = parseInt(data.stock, 10);
    }

    // Проверяем на отрицательные значения
    if (data.price !== undefined && data.price < 0) {
      throw new Error("Цена не может быть отрицательной");
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error("Количество на складе не может быть отрицательным");
    }

    const game = await Game.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          error: "Игра не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Ошибка при обновлении игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при обновлении игры",
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/protected/games/{id}:
 *   delete:
 *     summary: Удалить игру (защищенный)
 *     description: Удаляет игру из базы данных. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Игра успешно удалена
 *       404:
 *         description: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */
// Удаление игры
export async function DELETE(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const game = await Game.findByIdAndDelete(params.id);
    if (!game) {
      return NextResponse.json(
        {
          success: false,
          error: "Игра не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Игра успешно удалена",
    });
  } catch (error) {
    console.error("Ошибка при удалении игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при удалении игры",
      },
      { status: 500 }
    );
  }
}
