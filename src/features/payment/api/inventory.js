import connectDB from "@/shared/lib/db/mongodb";
import Console from "@/entities/console/model/schema";
import Accessory from "@/entities/accessory/model/schema";
import DigitalCopy from "@/entities/game/model/digital-copy-schema";
import PhysicalDisk from "@/entities/game/model/physical-disk-schema";
import { decryptCredential } from "@/shared/lib/crypto";

/**
 * Обновляет инвентарь после успешной оплаты.
 * Возвращает { allSuccessful, digitalCredentials } — credentials нужны для письма покупателю.
 */
export async function updateInventoryAfterPurchase(items) {
  try {
    await connectDB();

    const digitalCredentials = [];

    const updatePromises = items.map(async (item) => {
      const { id, type, quantity, platform, condition } = item;

      console.log(
        `Обновление инвентаря: ${id}, тип: ${type}, количество: ${quantity}`
      );

      switch (type) {
        case "console":
          return await updateConsoleStock(id, quantity);

        case "accessory":
          return await updateAccessoryStock(id, quantity);

        case "digital": {
          const result = await updateDigitalCopyStock(id, quantity);
          if (result.success && result.credentials.length > 0) {
            digitalCredentials.push({
              name: item.title || item.name || "Игра",
              platform: item.platform,
              credentials: result.credentials,
            });
          }
          return result.success;
        }

        case "physical":
          return await updatePhysicalDiskStock(id, platform, condition, quantity);

        default:
          console.warn(`Неизвестный тип товара: ${type}`);
          return false;
      }
    });

    const results = await Promise.all(updatePromises);
    const allSuccessful = results.every((r) => r === true);

    if (allSuccessful) {
      console.log("✅ Все товары успешно обновлены");
    } else {
      console.error("❌ Некоторые товары не удалось обновить");
    }

    return { allSuccessful, digitalCredentials };
  } catch (error) {
    console.error("Ошибка при обновлении инвентаря:", error);
    return { allSuccessful: false, digitalCredentials: [] };
  }
}

async function updateConsoleStock(consoleId, purchasedQuantity) {
  try {
    const item = await Console.findById(consoleId);
    if (!item) {
      console.error(`Консоль ${consoleId} не найдена`);
      return false;
    }
    if (item.stock < purchasedQuantity) {
      console.error(`Недостаточно консолей: есть ${item.stock}, нужно ${purchasedQuantity}`);
      return false;
    }
    item.stock -= purchasedQuantity;
    item.updatedAt = new Date();
    await item.save();
    console.log(`✅ Консоль ${item.title}: ${item.stock + purchasedQuantity} → ${item.stock}`);
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении консоли ${consoleId}:`, error);
    return false;
  }
}

async function updateAccessoryStock(accessoryId, purchasedQuantity) {
  try {
    const item = await Accessory.findById(accessoryId);
    if (!item) {
      console.error(`Аксессуар ${accessoryId} не найден`);
      return false;
    }
    if (item.stock < purchasedQuantity) {
      console.error(`Недостаточно аксессуаров: есть ${item.stock}, нужно ${purchasedQuantity}`);
      return false;
    }
    item.stock -= purchasedQuantity;
    item.updatedAt = new Date();
    await item.save();
    console.log(`✅ Аксессуар ${item.title}: ${item.stock + purchasedQuantity} → ${item.stock}`);
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении аксессуара ${accessoryId}:`, error);
    return false;
  }
}

/**
 * БАГ 3 FIX: ищем по _id документа DigitalCopy, а не по gameId.
 * Возвращает { success, credentials } для последующей отправки покупателю.
 */
async function updateDigitalCopyStock(digitalCopyId, purchasedQuantity) {
  try {
    const digitalCopy = await DigitalCopy.findById(digitalCopyId);

    if (!digitalCopy) {
      console.error(`DigitalCopy ${digitalCopyId} не найдена`);
      return { success: false, credentials: [] };
    }

    const activeCredentials = digitalCopy.credentials.filter((c) => c.isActive);

    if (activeCredentials.length < purchasedQuantity) {
      console.error(
        `Недостаточно активных аккаунтов: есть ${activeCredentials.length}, нужно ${purchasedQuantity}`
      );
      return { success: false, credentials: [] };
    }

    const deactivated = [];
    let count = 0;
    for (let i = 0; i < digitalCopy.credentials.length && count < purchasedQuantity; i++) {
      if (digitalCopy.credentials[i].isActive) {
        digitalCopy.credentials[i].isActive = false;
        deactivated.push({
          login: decryptCredential(digitalCopy.credentials[i].login),
          password: decryptCredential(digitalCopy.credentials[i].password),
        });
        count++;
      }
    }

    digitalCopy.updatedAt = new Date();
    await digitalCopy.save();

    console.log(`✅ DigitalCopy: деактивировано ${count} аккаунтов`);
    return { success: true, credentials: deactivated };
  } catch (error) {
    console.error(`Ошибка при обновлении DigitalCopy ${digitalCopyId}:`, error);
    return { success: false, credentials: [] };
  }
}

/**
 * БАГ 6 FIX: атомарное списание через findOneAndUpdate с проверкой остатка.
 * Исключает race condition при одновременных заказах.
 */
async function updatePhysicalDiskStock(gameId, platform, condition, purchasedQuantity) {
  try {
    const result = await PhysicalDisk.findOneAndUpdate(
      {
        gameId,
        platform,
        variants: {
          $elemMatch: {
            condition,
            stock: { $gte: purchasedQuantity },
          },
        },
      },
      {
        $inc: { "variants.$.stock": -purchasedQuantity },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!result) {
      console.error(
        `Физический диск не найден или недостаточно остатка: gameId=${gameId}, platform=${platform}, condition=${condition}`
      );
      return false;
    }

    console.log(`✅ Физический диск (${condition}, ${platform}): -${purchasedQuantity}`);
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении физического диска ${gameId}:`, error);
    return false;
  }
}
