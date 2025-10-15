import { NextResponse } from "next/server";

export async function GET() {
  console.log("🧪 Simple test API вызван");

  return NextResponse.json({
    success: true,
    message: "Simple test API работает",
    timestamp: new Date().toISOString(),
    server: "Next.js API Route",
  });
}

export async function POST(request) {
  try {
    console.log("🧪 Simple test API POST вызван");

    const body = await request.json();
    console.log("📦 Получены данные:", body);

    return NextResponse.json({
      success: true,
      message: "Simple test API POST работает",
      timestamp: new Date().toISOString(),
      receivedData: body,
    });
  } catch (error) {
    console.error("❌ Ошибка в simple test API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
