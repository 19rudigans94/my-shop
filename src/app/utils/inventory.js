import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Console from "@/models/Console";
import Accessory from "@/models/Accessory";
import DigitalCopy from "@/models/DigitalCopy";
import PhysicalDisk from "@/models/PhysicalDisk";

/**
 * Обновляет количество товаров в базе данных после успешной оплаты
 * @param {Array} items - Массив товаров из корзины
 * @returns {Promise<boolean>} - true если все обновления прошли успешно
 */
export async function updateInventoryAfterPurchase(items) {
  try {
    await connectDB();

    const updatePromises = items.map(async (item) => {
      const { id, type, quantity, platform, condition } = item;

      console.log(
        `Обновление количества для товара: ${id}, тип: ${type}, количество: ${quantity}`
      );

      switch (type) {
        case "console":
          return await updateConsoleStock(id, quantity);

        case "accessory":
          return await updateAccessoryStock(id, quantity);

        case "digital":
          return await updateDigitalCopyStock(id, platform, quantity);

        case "physical":
          return await updatePhysicalDiskStock(
            id,
            platform,
            condition,
            quantity
          );

        default:
          console.warn(`Неизвестный тип товара: ${type}`);
          return false;
      }
    });

    const results = await Promise.all(updatePromises);
    const allSuccessful = results.every((result) => result === true);

    if (allSuccessful) {
      console.log("✅ Все товары успешно обновлены в базе данных");
    } else {
      console.error("❌ Некоторые товары не удалось обновить");
    }

    return allSuccessful;
  } catch (error) {
    console.error("Ошибка при обновлении количества товаров:", error);
    return false;
  }
}

/**
 * Обновляет количество консолей
 */
async function updateConsoleStock(consoleId, purchasedQuantity) {
  try {
    const console = await Console.findById(consoleId);
    if (!console) {
      console.error(`Консоль с ID ${consoleId} не найдена`);
      return false;
    }

    if (console.stock < purchasedQuantity) {
      console.error(
        `Недостаточно товара на складе. Доступно: ${console.stock}, требуется: ${purchasedQuantity}`
      );
      return false;
    }

    console.stock -= purchasedQuantity;
    console.updatedAt = new Date();
    await console.save();

    console.log(
      `✅ Консоль ${console.title}: количество обновлено с ${
        console.stock + purchasedQuantity
      } до ${console.stock}`
    );
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении консоли ${consoleId}:`, error);
    return false;
  }
}

/**
 * Обновляет количество аксессуаров
 */
async function updateAccessoryStock(accessoryId, purchasedQuantity) {
  try {
    const accessory = await Accessory.findById(accessoryId);
    if (!accessory) {
      console.error(`Аксессуар с ID ${accessoryId} не найден`);
      return false;
    }

    if (accessory.stock < purchasedQuantity) {
      console.error(
        `Недостаточно товара на складе. Доступно: ${accessory.stock}, требуется: ${purchasedQuantity}`
      );
      return false;
    }

    accessory.stock -= purchasedQuantity;
    accessory.updatedAt = new Date();
    await accessory.save();

    console.log(
      `✅ Аксессуар ${accessory.title}: количество обновлено с ${
        accessory.stock + purchasedQuantity
      } до ${accessory.stock}`
    );
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении аксессуара ${accessoryId}:`, error);
    return false;
  }
}

/**
 * Обновляет количество цифровых копий (деактивирует аккаунты)
 */
async function updateDigitalCopyStock(gameId, platform, purchasedQuantity) {
  try {
    const digitalCopy = await DigitalCopy.findOne({
      gameId: gameId,
      platform: platform,
      isActive: true,
    });

    if (!digitalCopy) {
      console.error(
        `Цифровая копия для игры ${gameId} на платформе ${platform} не найдена`
      );
      return false;
    }

    // Находим активные аккаунты
    const activeCredentials = digitalCopy.credentials.filter(
      (cred) => cred.isActive
    );

    if (activeCredentials.length < purchasedQuantity) {
      console.error(
        `Недостаточно активных аккаунтов. Доступно: ${activeCredentials.length}, требуется: ${purchasedQuantity}`
      );
      return false;
    }

    // Деактивируем необходимое количество аккаунтов
    let deactivatedCount = 0;
    for (
      let i = 0;
      i < digitalCopy.credentials.length &&
      deactivatedCount < purchasedQuantity;
      i++
    ) {
      if (digitalCopy.credentials[i].isActive) {
        digitalCopy.credentials[i].isActive = false;
        deactivatedCount++;
      }
    }

    digitalCopy.updatedAt = new Date();
    await digitalCopy.save();

    console.log(
      `✅ Цифровая копия: деактивировано ${deactivatedCount} аккаунтов`
    );
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении цифровой копии ${gameId}:`, error);
    return false;
  }
}

/**
 * Обновляет количество физических дисков
 */
async function updatePhysicalDiskStock(
  gameId,
  platform,
  condition,
  purchasedQuantity
) {
  try {
    const physicalDisk = await PhysicalDisk.findOne({
      gameId: gameId,
      platform: platform,
    });

    if (!physicalDisk) {
      console.error(
        `Физический диск для игры ${gameId} на платформе ${platform} не найден`
      );
      return false;
    }

    // Находим нужный вариант (новый/б/у)
    const variant = physicalDisk.variants.find(
      (v) => v.condition === condition
    );
    if (!variant) {
      console.error(`Вариант ${condition} для игры ${gameId} не найден`);
      return false;
    }

    if (variant.stock < purchasedQuantity) {
      console.error(
        `Недостаточно товара на складе. Доступно: ${variant.stock}, требуется: ${purchasedQuantity}`
      );
      return false;
    }

    variant.stock -= purchasedQuantity;
    physicalDisk.updatedAt = new Date();
    await physicalDisk.save();

    console.log(
      `✅ Физический диск (${condition}): количество обновлено с ${
        variant.stock + purchasedQuantity
      } до ${variant.stock}`
    );
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении физического диска ${gameId}:`, error);
    return false;
  }
}

/**
 * Получает активные аккаунты для цифровой копии (для отправки покупателю)
 * @param {string} gameId - ID игры
 * @param {string} platform - Платформа
 * @param {number} quantity - Количество аккаунтов
 * @returns {Promise<Array>} - Массив аккаунтов
 */
export async function getDigitalGameCredentials(gameId, platform, quantity) {
  try {
    await connectDB();

    const digitalCopy = await DigitalCopy.findOne({
      gameId: gameId,
      platform: platform,
      isActive: true,
    });

    if (!digitalCopy) {
      console.error(
        `Цифровая копия для игры ${gameId} на платформе ${platform} не найдена`
      );
      return [];
    }

    // Находим неактивные аккаунты (те, что были только что куплены)
    const purchasedCredentials = digitalCopy.credentials
      .filter((cred) => !cred.isActive)
      .slice(-quantity); // Берем последние деактивированные

    return purchasedCredentials.map((cred) => ({
      login: cred.login,
      password: cred.password,
    }));
  } catch (error) {
    console.error("Ошибка при получении данных аккаунтов:", error);
    return [];
  }
}
