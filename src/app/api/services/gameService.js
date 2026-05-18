import Game from "@/models/Game";
import PhysicalDisk from "@/models/PhysicalDisk";
import { generateUniqueSlug } from "../../utils/slugUtils";
import {
  normalizeNumericFields,
  validateNonNegative,
  validateRequiredFields,
} from "../../utils/validation";
import { deleteFromPSCloud, extractKeyFromUrl } from "@/utils/psStorage";

/**
 * Получить все игры
 */
export async function getAllGames(sortBy = { createdAt: -1 }) {
  return await Game.find({}).sort(sortBy);
}

/**
 * Получить игру по slug
 */
export async function getGameBySlug(slug) {
  if (!slug) {
    throw new Error("Не указан slug игры");
  }
  return await Game.findOne({ slug }).lean();
}

/**
 * Получить игру по ID
 */
export async function getGameById(id) {
  if (!id) {
    throw new Error("Не указан ID игры");
  }
  return await Game.findById(id);
}

/**
 * Создать игру
 */
export async function createGame(data) {
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

  validateRequiredFields(data, ["title", "platforms", "description", "images"]);

  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  validateNonNegative({
    price: normalized.price,
    stock: normalized.stock,
  });

  normalized.images = Array.isArray(normalized.images)
    ? normalized.images
    : [];
  normalized.image = normalized.images[0]?.url || normalized.image;

  normalized.slug = await generateUniqueSlug(Game, normalized.title);

  const game = await Game.create(normalized);

  // Создание физических дисков для каждой платформы
  const physicalDisks = await Promise.all(
    data.platforms.map(async (platform) => {
      try {
        return await PhysicalDisk.create({
          gameId: game._id,
          platform,
          variants: [
            {
              condition: "new",
              stock: 0,
              price: 0,
            },
          ],
        });
      } catch (error) {
        console.error(
          `Ошибка при создании физического диска для ${platform}:`,
          error
        );
        return null;
      }
    })
  );

  // Фильтруем успешно созданные диски
  const successfulDisks = physicalDisks.filter((disk) => disk !== null);

  return { game, physicalDisks: successfulDisks };
}

/**
 * Обновить игру
 */
export async function updateGame(id, data) {
  if (!id) {
    throw new Error("Не указан ID игры");
  }

  const currentGame = await Game.findById(id);
  if (!currentGame) {
    throw new Error("Игра не найдена");
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
    data.slug = await generateUniqueSlug(Game, data.title, id);
  }

  const normalized = normalizeNumericFields(data, ["price", "stock"]);
  normalized.images = Array.isArray(normalized.images)
    ? normalized.images
    : undefined;
  if (normalized.images) {
    normalized.image = normalized.images[0]?.url || normalized.image;
  }

  const game = await Game.findByIdAndUpdate(
    id,
    { $set: normalized },
    { new: true, runValidators: true }
  );

  if (!game) {
    throw new Error("Игра не найдена");
  }

  const oldUrls = new Set(
    (currentGame.images || []).flatMap((img) => [img.url, img.thumbUrl]).filter(Boolean)
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

  return game;
}

/**
 * Удалить игру
 */
export async function deleteGame(id) {
  if (!id) {
    throw new Error("Не указан ID игры");
  }

  const game = await Game.findByIdAndDelete(id);
  if (!game) {
    throw new Error("Игра не найдена");
  }

  for (const img of game.images || []) {
    for (const url of [img.url, img.thumbUrl].filter(Boolean)) {
      const key = extractKeyFromUrl(url);
      if (key) await deleteFromPSCloud(key).catch(() => {});
    }
  }

  return game;
}
