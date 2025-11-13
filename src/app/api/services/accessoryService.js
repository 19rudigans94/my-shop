import Accessory from "@/models/Accessory";
import { generateUniqueSlug } from "../../utils/slugUtils";
import {
  normalizeNumericFields,
  validateRequiredFields,
} from "../../utils/validation";

/**
 * Получить все аксессуары с пагинацией
 */
export async function getAccessoriesWithPagination(filters = {}, options = {}) {
  const page = options.page || 1;
  const limit = options.limit || 12;
  const skip = (page - 1) * limit;

  // Исключаем пагинационные параметры из фильтров
  const cleanFilters = { ...filters };
  delete cleanFilters.page;
  delete cleanFilters.limit;

  // Убираем значения "all" из фильтров
  Object.keys(cleanFilters).forEach((key) => {
    if (cleanFilters[key] === "all" || !cleanFilters[key]) {
      delete cleanFilters[key];
    }
  });

  const total = await Accessory.countDocuments(cleanFilters);
  const accessories = await Accessory.find(cleanFilters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    accessories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Получить все аксессуары
 */
export async function getAllAccessories(sortBy = { createdAt: -1 }) {
  return await Accessory.find({}).sort(sortBy);
}

/**
 * Получить аксессуар по slug
 */
export async function getAccessoryBySlug(slug) {
  if (!slug) {
    throw new Error("Не указан slug аксессуара");
  }
  return await Accessory.findOne({ slug }).lean();
}

/**
 * Получить аксессуар по ID
 */
export async function getAccessoryById(id) {
  if (!id) {
    throw new Error("Не указан ID аксессуара");
  }
  return await Accessory.findById(id);
}

/**
 * Создать аксессуар
 */
export async function createAccessory(data) {
  // Валидация обязательных полей
  validateRequiredFields(data, [
    "title",
    "platform",
    "price",
    "description",
    "image",
    "stock",
  ]);

  // Нормализация числовых полей
  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  // Генерация уникального slug
  normalized.slug = await generateUniqueSlug(Accessory, normalized.title);

  return await Accessory.create(normalized);
}

/**
 * Обновить аксессуар
 */
export async function updateAccessory(id, data) {
  if (!id) {
    throw new Error("Не указан ID аксессуара");
  }

  // Если изменилось название, обновляем slug
  if (data.title) {
    data.slug = await generateUniqueSlug(Accessory, data.title, id);
  }

  // Нормализация числовых полей
  const normalized = normalizeNumericFields(data, ["stock"]);

  const accessory = await Accessory.findByIdAndUpdate(
    id,
    { $set: normalized },
    { new: true, runValidators: true }
  );

  if (!accessory) {
    throw new Error("Аксессуар не найден");
  }

  return accessory;
}

/**
 * Удалить аксессуар
 */
export async function deleteAccessory(id) {
  if (!id) {
    throw new Error("Не указан ID аксессуара");
  }

  const accessory = await Accessory.findByIdAndDelete(id);
  if (!accessory) {
    throw new Error("Аксессуар не найден");
  }

  return accessory;
}
