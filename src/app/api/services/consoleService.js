import Console from "@/models/Console";
import { generateUniqueSlug } from "../../utils/slugUtils";
import {
  normalizeNumericFields,
  validateNonNegative,
  validateRequiredFields,
} from "../../utils/validation";

/**
 * Получить все консоли
 */
export async function getAllConsoles(sortBy = { createdAt: -1 }) {
  return await Console.find({}).sort(sortBy);
}

/**
 * Получить консоль по slug
 */
export async function getConsoleBySlug(slug) {
  if (!slug) {
    throw new Error("Не указан slug консоли");
  }
  return await Console.findOne({ slug }).lean();
}

/**
 * Получить консоль по ID
 */
export async function getConsoleById(id) {
  if (!id) {
    throw new Error("Не указан ID консоли");
  }
  return await Console.findById(id);
}

/**
 * Создать консоль
 */
export async function createConsole(data) {
  if (!Array.isArray(data.images) || data.images.length === 0) {
    if (data.image) {
      data.images = [
        {
          url: data.image,
          thumbUrl: data.image,
          filename: "",
          alt: "",
          size: 0,
          width: 0,
          height: 0,
          uploadedAt: new Date(),
        },
      ];
    }
  }

  validateRequiredFields(data, [
    "title",
    "state",
    "price",
    "description",
    "images",
  ]);

  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  validateNonNegative({
    price: normalized.price,
    stock: normalized.stock,
  });

  normalized.images = Array.isArray(normalized.images)
    ? normalized.images
    : [];
  normalized.image = normalized.images[0]?.url || normalized.image;

  normalized.slug = await generateUniqueSlug(Console, normalized.title);

  return await Console.create(normalized);
}

/**
 * Обновить консоль
 */
export async function updateConsole(id, data) {
  if (!id) {
    throw new Error("Не указан ID консоли");
  }

  if (!Array.isArray(data.images) || data.images.length === 0) {
    if (data.image) {
      data.images = [
        {
          url: data.image,
          thumbUrl: data.image,
          filename: "",
          alt: "",
          size: 0,
          width: 0,
          height: 0,
          uploadedAt: new Date(),
        },
      ];
    }
  }

  if (data.title) {
    data.slug = await generateUniqueSlug(Console, data.title, id);
  }

  const normalized = normalizeNumericFields(data, ["price", "stock"]);
  normalized.images = Array.isArray(normalized.images)
    ? normalized.images
    : undefined;
  if (normalized.images) {
    normalized.image = normalized.images[0]?.url || normalized.image;
  }

  const console = await Console.findByIdAndUpdate(
    id,
    { $set: normalized },
    { new: true, runValidators: true }
  );

  if (!console) {
    throw new Error("Консоль не найдена");
  }

  return console;
}

/**
 * Удалить консоль
 */
export async function deleteConsole(id) {
  if (!id) {
    throw new Error("Не указан ID консоли");
  }

  const console = await Console.findByIdAndDelete(id);
  if (!console) {
    throw new Error("Консоль не найдена");
  }

  return console;
}
