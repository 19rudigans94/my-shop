import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Game from "@/entities/game/model/schema";
import DigitalCopy from "@/entities/game/model/digital-copy-schema";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Идентификатор игры не указан" },
        { status: 400 }
      );
    }

    await connectDB();

    const game = await Game.findOne({ slug }).lean();

    if (!game) {
      return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
    }

    const digitalCopies = await DigitalCopy.find({
      gameId: game._id,
      isActive: true,
    }).lean();

    const copies = digitalCopies.map((copy) => ({
      _id: copy._id.toString(),
      price: copy.price,
      platform: copy.platform,
      totalAvailable: Array.isArray(copy.credentials)
        ? copy.credentials.filter((cred) => cred.isActive).length
        : 0,
    }));

    return NextResponse.json({ success: true, copies });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка сервера: " + error.message },
      { status: 500 }
    );
  }
}
