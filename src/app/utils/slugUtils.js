import { generateSlug } from "@/lib/utils";

/**
 * Генерация уникального slug с проверкой на существование
 */
export async function generateUniqueSlug(Model, title, excludeId = null) {
  let slug = generateSlug(title);
  let existing = await Model.findOne({
    slug,
    ...(excludeId && { _id: { $ne: excludeId } }),
  });

  let counter = 1;
  while (existing) {
    slug = `${generateSlug(title)}-${counter}`;
    existing = await Model.findOne({
      slug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    });
    counter++;
  }

  return slug;
}
