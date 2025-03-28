import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    const connection = await connectDB();
    if (!connection) {
      throw new Error("Ошибка подключения к базе данных");
    }

    const collections = await mongoose.connection.db.collections();
    const collectionNames = collections.map(
      (collection) => collection.collectionName
    );

    return NextResponse.json({
      success: true,
      collections: collectionNames,
    });
  } catch (error) {
    console.error("Ошибка при получении коллекций:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при получении коллекций из базы данных",
      },
      { status: 500 }
    );
  }
}
