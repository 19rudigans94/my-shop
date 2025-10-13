import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  return NextResponse.json({
    success: true,
    message: "PayLink verification endpoint работает",
    timestamp: new Date().toISOString(),
    url: request.url,
    method: "GET",
    params: Object.fromEntries(searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const { searchParams } = new URL(request.url);

    return NextResponse.json({
      success: true,
      message: "PayLink verification endpoint работает",
      timestamp: new Date().toISOString(),
      url: request.url,
      method: "POST",
      params: Object.fromEntries(searchParams.entries()),
      body: body,
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
