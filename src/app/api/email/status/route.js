import { NextResponse } from "next/server";
import { testEmailConfiguration } from "@/shared/lib/email";

/**
 * Диагностический endpoint для проверки email системы
 * GET /api/email/status
 */
export async function GET() {
  console.log("🔍 Проверка статуса email системы...");

  try {
    const result = await testEmailConfiguration();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("💥 Ошибка при проверке email системы:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при проверке email системы",
        details: {
          name: error.name,
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
