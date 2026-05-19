import { NextResponse } from "next/server";

/**
 * Диагностический endpoint для проверки доступности PayLink API
 * GET /api/paylink/status
 */
export async function GET() {
  console.log("🔍 Проверка статуса PayLink API...");

  try {
    const shopSecret = process.env.PAYLINK_SHOP_SECRET;
    const shopId = process.env.PAYLINK_SHOP_ID;

    if (!shopId || !shopSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "PayLink не настроен",
          details: {
            shopId: !!shopId,
            shopSecret: !!shopSecret,
          },
        },
        { status: 500 }
      );
    }

    // Выполняем тестовый запрос к PayLink API
    const authString = `${shopId}:${shopSecret}`;
    const base64Auth = Buffer.from(authString).toString("base64");

    console.log("📡 Отправка тестового запроса к PayLink API...");

    const response = await fetch("https://api.paylink.kz/products", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${base64Auth}`,
      },
    });

    console.log("📡 Ответ от PayLink API:");
    console.log("- Статус:", response.status, response.statusText);

    let responseData;
    const responseText = await response.text();

    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = {
        rawResponse: responseText.substring(0, 500),
        parseError: parseError.message,
      };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      isAvailable: response.ok,
      timestamp: new Date().toISOString(),
      response: responseData,
    });
  } catch (error) {
    console.error("💥 Ошибка при проверке PayLink API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при проверке PayLink API",
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
