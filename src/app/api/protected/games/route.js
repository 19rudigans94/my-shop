import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import PhysicalDisk from "@/models/PhysicalDisk";
import { generateSlug } from "@/lib/utils";

/**
 * @swagger
 * /api/protected/games:
 *   get:
 *     summary: Получить список игр (защищенный)
 *     description: Получает полный список игр из базы данных. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список игр успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       500:
 *         description: Ошибка сервера
 */
// Получение списка игр
export async function GET() {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const games = await Game.find({});
    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Ошибка при получении игр:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении игр из базы данных",
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/protected/games:
 *   post:
 *     summary: Создать новую игру (защищенный)
 *     description: Создает новую игру в базе данных и автоматически создает физические диски для всех платформ. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - platforms
 *               - description
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["PS5", "PS4", "PC"]
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Игра успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 *                 physicalDisks:
 *                   type: array
 *       500:
 *         description: Ошибка сервера
 */
// Создание новой игры
export async function POST(request) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const data = await request.json();

    // Проверяем обязательные поля
    if (!data.title || !data.platforms || !data.description || !data.image) {
      throw new Error("Не все обязательные поля заполнены");
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

    // Генерируем слаг из названия
    let slug = generateSlug(data.title);

    // Проверяем, существует ли уже игра с таким слагом
    let existingGame = await Game.findOne({ slug });
    let counter = 1;

    // Если слаг уже существует, добавляем к нему число
    while (existingGame) {
      slug = `${generateSlug(data.title)}-${counter}`;
      existingGame = await Game.findOne({ slug });
      counter++;
    }

    // Добавляем слаг в данные
    data.slug = slug;

    // Создаем игру
    const game = await Game.create(data);

    // Создаем физические диски для каждой платформы
    const physicalDisks = await Promise.all(
      data.platforms.map(async (platform) => {
        try {
          return await PhysicalDisk.create({
            gameId: game._id,
            platform,
            variants: [
              {
                condition: "new",
                stock: 0,
                price: 0,
              },
            ],
          });
        } catch (error) {
          // Если произошла ошибка при создании физического диска,
          // пропускаем его и продолжаем с другими
          console.error(
            `Ошибка при создании физического диска для ${platform}:`,
            error
          );
          return null;
        }
      })
    );

    // Фильтруем успешно созданные физические диски
    const successfulDisks = physicalDisks.filter((disk) => disk !== null);

    return NextResponse.json({
      success: true,
      game,
      physicalDisks: successfulDisks,
    });
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при создании игры",
      },
      { status: 500 }
    );
  }
}
