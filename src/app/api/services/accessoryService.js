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
    "platform",
    "price",
    "description",
    "images",
    "stock",
  ]);

  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  normalized.images = Array.isArray(normalized.images)
    ? normalized.images
    : [];
  normalized.image = normalized.images[0]?.url || normalized.image;

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
    data.slug = await generateUniqueSlug(Accessory, data.title, id);
  }

  const normalized = normalizeNumericFields(data, ["stock"]);
  normalized.images = Array.isArray(normalized.images)
    ? normalized.images
    : undefined;
  if (normalized.images) {
    normalized.image = normalized.images[0]?.url || normalized.image;
  }

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
