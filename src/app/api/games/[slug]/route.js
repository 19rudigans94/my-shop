import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

/**
 * @swagger
 * /api/games/{slug}:
 *   get:
 *     summary: Получить игру по slug
 *     description: Возвращает детальную информацию об игре по её slug
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор игры
 *         example: the-last-of-us-part-2
 *     responses:
 *       200:
 *         description: Игра успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: Игра не найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */
export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const { slug } = await params;
    if (!slug) {
      throw new Error("Не указан slug игры");
    }

    const game = await Game.findOne({ slug }).lean();

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
