import { NextResponse } from "next/server";
import { uploadFileToS3 } from "@/shared/lib/storage/s3";

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_UPLOAD_TYPES = ["games", "consoles", "accessories"];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const uploadType = formData.get("type");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    if (!ALLOWED_UPLOAD_TYPES.includes(uploadType)) {
      return NextResponse.json({ error: "Неверный тип загрузки" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Допустимые форматы: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Файл превышает 10 МБ" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop().toLowerCase();
    const key = `${uploadType}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const url = await uploadFileToS3(buffer, key, file.type);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 });
  }
}
