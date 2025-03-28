import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET() {
  try {
    await connectDB();
    const games = await Game.find({}).sort({ createdAt: -1 });
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении списка игр" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const game = await Game.create(data);
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании игры" },
      { status: 500 }
    );
  }
}
