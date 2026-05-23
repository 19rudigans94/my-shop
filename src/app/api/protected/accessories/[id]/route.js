import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Accessory from "@/entities/accessory/model/schema";
import { generateUniqueSlug } from "@/shared/lib/slug";
import { deleteImagesFromS3 } from "@/shared/lib/storage/s3";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) throw new Error("Ошибка подключения к базе данных");

    const accessory = await Accessory.findById(params.id);
    if (!accessory) {
      return NextResponse.json({ success: false, error: "Аксессуар не найден" }, { status: 404 });
    }

    return NextResponse.json({ success: true, accessory });
  } catch (error) {
    console.error("Ошибка при получении аксессуара:", error);
    return NextResponse.json({ success: false, error: error.message || "Ошибка при получении аксессуара" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) throw new Error("Ошибка подключения к базе данных");

    const { id } = params;
    const data = await request.json();

    if (data.title) {
      data.slug = await generateUniqueSlug(data.title, Accessory, id);
    }

    if (typeof data.stock === "string") data.stock = parseInt(data.stock, 10);

    if (data.images) {
      const existing = await Accessory.findById(id).select("images");
      if (existing) {
        const removed = (existing.images || []).filter((url) => !data.images.includes(url));
        await deleteImagesFromS3(removed);
      }
    }

    const accessory = await Accessory.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!accessory) {
      return NextResponse.json({ success: false, error: "Аксессуар не найден" }, { status: 404 });
    }

    return NextResponse.json({ success: true, accessory });
  } catch (error) {
    console.error("Ошибка при обновлении аксессуара:", error);
    return NextResponse.json({ success: false, error: error.message || "Ошибка при обновлении аксессуара" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) throw new Error("Ошибка подключения к базе данных");

    const accessory = await Accessory.findByIdAndDelete(params.id);
    if (!accessory) {
      return NextResponse.json({ success: false, error: "Аксессуар не найден" }, { status: 404 });
    }

    await deleteImagesFromS3(accessory.images);

    return NextResponse.json({ success: true, message: "Аксессуар успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении аксессуара:", error);
    return NextResponse.json({ success: false, error: error.message || "Ошибка при удалении аксессуара" }, { status: 500 });
  }
}
