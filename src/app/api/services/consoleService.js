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
  // Валидация обязательных полей
  validateRequiredFields(data, [
    "title",
    "state",
    "price",
    "description",
    "image",
  ]);

  // Нормализация числовых полей
  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  // Проверка на отрицательные значения
  validateNonNegative({
    price: normalized.price,
    stock: normalized.stock,
  });

  // Генерация уникального slug
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

  // Если изменилось название, обновляем slug
  if (data.title) {
    data.slug = await generateUniqueSlug(Console, data.title, id);
  }

  // Нормализация числовых полей
  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  // Проверка на отрицательные значения
  validateNonNegative({
    price: normalized.price,
    stock: normalized.stock,
  });

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
