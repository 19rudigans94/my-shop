import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Получить OpenAPI спецификацию
 *     description: Возвращает полную OpenAPI спецификацию в формате JSON
 *     responses:
 *       200:
 *         description: Успешный ответ с OpenAPI спецификацией
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
