import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Console from "@/entities/console/model/schema";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const consoles = await Console.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, consoles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка при получении списка консолей" },
      { status: 500 }
    );
  }
}

// Создание консолей только через /api/protected/consoles (требует авторизации)
