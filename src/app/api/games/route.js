import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Получить список всех игр
 *     description: Возвращает массив всех игр из базы данных
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком игр
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    await connectDB();
    const games = await Game.find({}).sort({ createdAt: -1 });
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении списка игр" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Создать новую игру
 *     description: Добавляет новую игру в базу данных
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название игры
 *               slug:
 *                 type: string
 *                 description: URL-friendly название
 *               description:
 *                 type: string
 *                 description: Описание игры
 *               price:
 *                 type: number
 *                 description: Цена игры
 *               category:
 *                 type: string
 *                 description: Категория игры
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив URL изображений
 *     responses:
 *       201:
 *         description: Игра успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const game = await Game.create(data);
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании игры" },
      { status: 500 }
    );
  }
}
