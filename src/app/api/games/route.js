import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Game from "@/entities/game/model/schema";

export async function GET() {
  try {
    await connectDB();
    const games = await Game.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, games });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка при получении списка игр!" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const game = await Game.create(data);
    return NextResponse.json({ success: true, game }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка при создании игры" },
      { status: 500 }
    );
  }
}
