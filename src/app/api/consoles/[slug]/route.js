import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Console from "@/models/Console";

/**
 * @swagger
 * /api/consoles/{slug}:
 *   get:
 *     summary: Получить консоль по slug
 *     description: Возвращает детальную информацию о консоли по её slug
 *     tags: [Consoles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор консоли
 *         example: playstation-5
 *     responses:
 *       200:
 *         description: Консоль успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 console:
 *                   $ref: '#/components/schemas/Console'
 *       400:
 *         description: Не указан slug
 *       404:
 *         description: Консоль не найдена
 *       500:
 *         description: Ошибка сервера
 */
export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      return NextResponse.json(
        {
          success: false,
          error: "Ошибка подключения к базе данных",
        },
        { status: 500 }
      );
    }

    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Не указан slug консоли",
        },
        { status: 400 }
      );
    }

    const console = await Console.findOne({ slug }).lean();

    if (!console) {
      return NextResponse.json(
        {
          success: false,
          error: "Консоль не найдена",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      console,
    });
  } catch (error) {
    console.error("Ошибка при получении консоли:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Ошибка при получении консоли",
      },
      { status: 500 }
    );
  }
}
