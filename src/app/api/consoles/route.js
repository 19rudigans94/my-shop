import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Console from "@/entities/console/model/schema";

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

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const newConsole = await Console.create(data);
    return NextResponse.json({ success: true, console: newConsole }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка при создании консоли" },
      { status: 500 }
    );
  }
}
