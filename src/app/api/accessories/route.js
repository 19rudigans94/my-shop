import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";
import { generateSlug } from "@/lib/utils";

/**
 * @swagger
 * /api/accessories:
 *   get:
 *     summary: Получить список аксессуаров с пагинацией
 *     description: Возвращает список аксессуаров с поддержкой пагинации и фильтрации
 *     tags: [Accessories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Количество элементов на странице
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Фильтр по платформе
 *     responses:
 *       200:
 *         description: Успешный ответ со списком аксессуаров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Accessory'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export async function GET(request) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    // Формируем объект фильтров
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page" && key !== "limit" && value && value !== "all") {
        filters[key] = value;
      }
    }

    // console.log("Фильтры:", filters);

    // Получаем общее количество записей
    const total = await Accessory.countDocuments(filters);
    // console.log("Всего записей:", total);

    // Получаем отфильтрованные аксессуары с пагинацией
    const accessories = await Accessory.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Преобразуем в простые объекты

    // console.log("Найдено аксессуаров:", accessories.length);

    if (!accessories) {
      throw new Error("Аксессуары не найдены");
    }

    return NextResponse.json({
      success: true,
      accessories: accessories || [],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Ошибка при получении списка аксессуаров:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении списка аксессуаров",
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accessories:
 *   post:
 *     summary: Создать новый аксессуар
 *     description: Добавляет новый аксессуар в базу данных с автоматической генерацией slug
 *     tags: [Accessories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - platform
 *               - price
 *               - description
 *               - image
 *               - stock
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название аксессуара
 *               platform:
 *                 type: string
 *                 description: Платформа (например, PS5, Xbox)
 *               price:
 *                 type: number
 *                 description: Цена аксессуара
 *               description:
 *                 type: string
 *                 description: Описание аксессуара
 *               image:
 *                 type: string
 *                 description: URL изображения
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *     responses:
 *       201:
 *         description: Аксессуар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessory:
 *                   $ref: '#/components/schemas/Accessory'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export async function POST(request) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const data = await request.json();

    // Проверяем обязательные поля
    if (
      !data.title ||
      !data.platform ||
      !data.price ||
      !data.description ||
      !data.image ||
      typeof data.stock === "undefined"
    ) {
      throw new Error("Не все обязательные поля заполнены");
    }

    // Преобразуем stock в число, если оно передано как строка
    if (typeof data.stock === "string") {
      data.stock = parseInt(data.stock, 10);
    }

    // Генерируем слаг из названия
    let slug = generateSlug(data.title);

    // Проверяем, существует ли уже аксессуар с таким слагом
    let existingAccessory = await Accessory.findOne({ slug });
    let counter = 1;

    // Если слаг уже существует, добавляем к нему число
    while (existingAccessory) {
      slug = `${generateSlug(data.title)}-${counter}`;
      existingAccessory = await Accessory.findOne({ slug });
      counter++;
    }

    // Добавляем слаг в данные
    data.slug = slug;

    const accessory = await Accessory.create(data);

    return NextResponse.json(
      {
        success: true,
        accessory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ошибка при создании аксессуара:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при создании аксессуара",
      },
      { status: 500 }
    );
  }
}
