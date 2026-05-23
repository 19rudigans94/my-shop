import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Console from "@/entities/console/model/schema";
import { generateUniqueSlug } from "@/shared/lib/slug";
import { deleteImagesFromS3 } from "@/shared/lib/storage/s3";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) throw new Error("Ошибка подключения к базе данных");

    const console = await Console.findById(params.id);
    if (!console) {
      return NextResponse.json({ success: false, error: "Консоль не найдена" }, { status: 404 });
    }

    return NextResponse.json({ success: true, console });
  } catch (error) {
    console.error("Ошибка при получении консоли:", error);
    return NextResponse.json({ success: false, error: error.message || "Ошибка при получении консоли" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) throw new Error("Ошибка подключения к базе данных");

    const { id } = params;
    const data = await request.json();

    if (data.title) {
      data.slug = await generateUniqueSlug(data.title, Console, id);
    }

    if (typeof data.price === "string") data.price = parseFloat(data.price);
    if (typeof data.stock === "string") data.stock = parseInt(data.stock, 10);

    if (data.price !== undefined && data.price < 0) throw new Error("Цена не может быть отрицательной");
    if (data.stock !== undefined && data.stock < 0) throw new Error("Количество на складе не может быть отрицательным");

    if (data.images) {
      const existing = await Console.findById(id).select("images");
      if (existing) {
        const removed = (existing.images || []).filter((url) => !data.images.includes(url));
        await deleteImagesFromS3(removed);
      }
    }

    const console = await Console.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!console) {
      return NextResponse.json({ success: false, error: "Консоль не найдена" }, { status: 404 });
    }

    return NextResponse.json({ success: true, console });
  } catch (error) {
    console.error("Ошибка при обновлении консоли:", error);
    return NextResponse.json({ success: false, error: error.message || "Ошибка при обновлении консоли" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const connection = await connectDB();
    if (!connection) throw new Error("Ошибка подключения к базе данных");

    const console = await Console.findByIdAndDelete(params.id);
    if (!console) {
      return NextResponse.json({ success: false, error: "Консоль не найдена" }, { status: 404 });
    }

    await deleteImagesFromS3(console.images);

    return NextResponse.json({ success: true, message: "Консоль успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении консоли:", error);
    return NextResponse.json({ success: false, error: error.message || "Ошибка при удалении консоли" }, { status: 500 });
  }
}
