import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Console from "@/models/Console";

export async function GET() {
  try {
    await connectDB();
    const consoles = await Console.find({}).sort({ createdAt: -1 });
    return NextResponse.json(consoles);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении списка консолей" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const console = await Console.create(data);
    return NextResponse.json(console, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании консоли" },
      { status: 500 }
    );
  }
}
