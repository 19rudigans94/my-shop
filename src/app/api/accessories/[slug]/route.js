import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Accessory from "@/models/Accessory";

export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const { slug } = await params;
    if (!slug) {
      throw new Error("Не указан slug аксессуара");
    }

    const accessory = await Accessory.findOne({ slug }).lean();

    if (!accessory) {
      return NextResponse.json(
        {
          success: false,
          error: "Аксессуар не найден",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error) {
    console.error("Ошибка при получении аксессуара:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении аксессуара",
      },
      { status: 500 }
    );
  }
}
