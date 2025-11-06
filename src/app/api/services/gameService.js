import Game from "@/models/Game";
import PhysicalDisk from "@/models/PhysicalDisk";
import { generateUniqueSlug } from "../../utils/slugUtils";
import {
  normalizeNumericFields,
  validateNonNegative,
  validateRequiredFields,
} from "../../utils/validation";

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
  // Валидация обязательных полей
  validateRequiredFields(data, ["title", "platforms", "description", "image"]);

  // Нормализация числовых полей
  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  // Проверка на отрицательные значения
  validateNonNegative({
    price: normalized.price,
    stock: normalized.stock,
  });

  // Генерация уникального slug
  normalized.slug = await generateUniqueSlug(Game, normalized.title);

  // Создание игры
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

  // Если изменилось название, обновляем slug
  if (data.title) {
    data.slug = await generateUniqueSlug(Game, data.title, id);
  }

  // Нормализация числовых полей
  const normalized = normalizeNumericFields(data, ["price", "stock"]);

  // Проверка на отрицательные значения
  validateNonNegative({
    price: normalized.price,
    stock: normalized.stock,
  });

  const game = await Game.findByIdAndUpdate(
    id,
    { $set: normalized },
    { new: true, runValidators: true }
  );

  if (!game) {
    throw new Error("Игра не найдена");
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

  return game;
}
