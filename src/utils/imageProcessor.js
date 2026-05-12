import { randomUUID } from "crypto";
import sharp from "sharp";
import { uploadToPSCloud } from "@/utils/psStorage";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 4000;
const FULL_MAX_DIMENSION = 1920;
const THUMB_MAX_DIMENSION = 480;

function validateFile(file) {
  if (!file) {
    throw new Error("Файл изображения не найден");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Допустимы только JPEG, PNG или WebP изображения");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Максимальный размер изображения 5MB");
  }
}

function buildKey(category, suffix) {
  const safeCategory = String(category || "misc").replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${safeCategory}/${Date.now()}-${randomUUID()}-${suffix}.webp`;
}

export async function processUploadImage(file, category = "misc", alt = "") {
  validateFile(file);

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  let image = sharp(fileBuffer).rotate();

  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  if (width === 0 || height === 0) {
    throw new Error("Не удалось определить размеры изображения");
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    image = image.resize({
      width: Math.min(width, MAX_DIMENSION),
      height: Math.min(height, MAX_DIMENSION),
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const fullBuffer = await image
    .clone()
    .resize({
      width: Math.min(width, FULL_MAX_DIMENSION),
      height: Math.min(height, FULL_MAX_DIMENSION),
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  const thumbBuffer = await image
    .clone()
    .resize({
      width: THUMB_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 75 })
    .toBuffer();

  const fullMeta = await sharp(fullBuffer).metadata();
  const fullFilename = buildKey(category, "full");
  const thumbFilename = buildKey(category, "thumb");

  const url = await uploadToPSCloud(fullBuffer, fullFilename, "image/webp");
  const thumbUrl = await uploadToPSCloud(thumbBuffer, thumbFilename, "image/webp");

  return {
    filename: fullFilename,
    thumbUrl,
    url,
    alt: alt || "",
    size: fullBuffer.length,
    width: fullMeta.width || null,
    height: fullMeta.height || null,
    uploadedAt: new Date().toISOString(),
  };
}
