import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";

/**
 * @swagger
 * /api/accessories/{slug}:
 *   get:
 *     summary: Получить аксессуар по slug
 *     description: Возвращает детальную информацию об аксессуаре по его slug
 *     tags: [Accessories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор аксессуара
 *         example: dualsense-controller
 *     responses:
 *       200:
 *         description: Аксессуар успешно найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessory:
 *                   $ref: '#/components/schemas/Accessory'
 *       404:
 *         description: Аксессуар не найден
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
      throw new Error("Не указан slug аксессуара");
    }

    const accessory = await Accessory.findOne({ slug }).lean();

    if (!accessory) {
      return NextResponse.json(
        {
          success: false,
          error: "Аксессуар не найден",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error) {
    console.error("Ошибка при получении аксессуара:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении аксессуара",
      },
      { status: 500 }
    );
  }
}
