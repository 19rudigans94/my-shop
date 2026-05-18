import Console from "../model/Console.js";
import { generateUniqueSlug } from "@/shared/utils/slugUtils.js";
import {
  normalizeNumericFields,
  validateNonNegative,
  validateRequiredFields,
} from "@/shared/utils/validation.js";
import { deleteFromPSCloud, extractKeyFromUrl } from "@/shared/utils/psStorage.js";

export async function getAllConsoles(sortBy = { createdAt: -1 }) {
  return await Console.find({}).sort(sortBy);
}

export async function getConsoleBySlug(slug) {
  if (!slug) {
    throw new Error("Не указан slug консоли");
  }
  return await Console.findOne({ slug }).lean();
}

export async function getConsoleById(id) {
  if (!id) {
    throw new Error("Не указан ID консоли");
  }
  return await Console.findById(id);
}

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

  validateRequiredFields(data, ["title", "state", "price", "description", "images"]);

  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  validateNonNegative({
    price: normalized.price,
    stock: normalized.stock,
  });

  normalized.images = Array.isArray(normalized.images) ? normalized.images : [];
  normalized.image = normalized.images[0]?.url || normalized.image;
  normalized.slug = await generateUniqueSlug(Console, normalized.title);

  return await Console.create(normalized);
}

export async function updateConsole(id, data) {
  if (!id) {
    throw new Error("Не указан ID консоли");
  }

  const currentConsole = await Console.findById(id);
  if (!currentConsole) {
    throw new Error("Консоль не найдена");
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
  normalized.images = Array.isArray(normalized.images) ? normalized.images : undefined;
  if (normalized.images) {
    normalized.image = normalized.images[0]?.url || normalized.image;
  }

  const updatedConsole = await Console.findByIdAndUpdate(
    id,
    { $set: normalized },
    { new: true, runValidators: true }
  );

  if (!updatedConsole) {
    throw new Error("Консоль не найдена");
  }

  const oldUrls = new Set(
    (currentConsole.images || []).flatMap((img) => [img.url, img.thumbUrl]).filter(Boolean)
  );
  const newUrls = new Set(
    (normalized.images || []).flatMap((img) => [img.url, img.thumbUrl]).filter(Boolean)
  );
  for (const url of oldUrls) {
    if (!newUrls.has(url)) {
      const key = extractKeyFromUrl(url);
      if (key) await deleteFromPSCloud(key).catch(() => {});
    }
  }

  return updatedConsole;
}

export async function deleteConsole(id) {
  if (!id) {
    throw new Error("Не указан ID консоли");
  }

  const deletedConsole = await Console.findByIdAndDelete(id);
  if (!deletedConsole) {
    throw new Error("Консоль не найдена");
  }

  for (const img of deletedConsole.images || []) {
    for (const url of [img.url, img.thumbUrl].filter(Boolean)) {
      const key = extractKeyFromUrl(url);
      if (key) await deleteFromPSCloud(key).catch(() => {});
    }
  }

  return deletedConsole;
}
