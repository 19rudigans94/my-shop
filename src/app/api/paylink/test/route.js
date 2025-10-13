import { NextResponse } from "next/server";

export async function GET(request) {
  const timestamp = new Date().toISOString();

  console.log("🧪 Тестовый endpoint вызван:", timestamp);

  return NextResponse.json({
    success: true,
    message: "PayLink test endpoint работает",
    timestamp: timestamp,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });
}

export async function POST(request) {
  const timestamp = new Date().toISOString();
  const body = await request.json().catch(() => ({}));

  console.log("🧪 Тестовый POST endpoint вызван:", timestamp);
  console.log("📦 Тело запроса:", body);

  return NextResponse.json({
    success: true,
    message: "PayLink test POST endpoint работает",
    timestamp: timestamp,
    body: body,
  });
}
