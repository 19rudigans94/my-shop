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
      // БАГ 1 FIX: добавлен variant для корректной маршрутизации игровых позиций
      const { id, type, quantity, platform, condition, variant } = item;

      console.log(
        `Обновление инвентаря: ${id}, тип: ${type}, variant: ${variant}, количество: ${quantity}`
      );

      switch (type) {
        case "console":
          return await updateConsoleStock(id, quantity);

        case "accessory":
          return await updateAccessoryStock(id, quantity);

        // БАГ 1 FIX: cart items для игр имеют type:"game" и variant:"physical"|"digital"
        case "game": {
          if (variant === "digital") {
            const result = await updateDigitalCopyStock(id, quantity);
            if (result.success && result.credentials.length > 0) {
              digitalCredentials.push({
                name: item.title || item.name || "Игра",
                platform,
                credentials: result.credentials,
              });
            }
            return result.success;
          }
          return await updatePhysicalDiskStock(id, platform, condition, quantity);
        }

        // DB-восстановленные заказы (после фикса createOrder) имеют productType:"digital"/"physical"
        case "digital": {
          const result = await updateDigitalCopyStock(id, quantity);
          if (result.success && result.credentials.length > 0) {
            digitalCredentials.push({
              name: item.title || item.name || "Игра",
              platform,
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

// БАГ D FIX: атомарное списание через findOneAndUpdate — исключает race condition
async function updateConsoleStock(consoleId, purchasedQuantity) {
  try {
    const result = await Console.findOneAndUpdate(
      { _id: consoleId, stock: { $gte: purchasedQuantity } },
      { $inc: { stock: -purchasedQuantity }, $set: { updatedAt: new Date() } },
      { new: true }
    );
    if (!result) {
      console.error(`Консоль ${consoleId} не найдена или недостаточно остатка`);
      return false;
    }
    console.log(`✅ Консоль ${result.title}: -${purchasedQuantity}, остаток: ${result.stock}`);
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении консоли ${consoleId}:`, error);
    return false;
  }
}

// БАГ D FIX: то же для аксессуаров
async function updateAccessoryStock(accessoryId, purchasedQuantity) {
  try {
    const result = await Accessory.findOneAndUpdate(
      { _id: accessoryId, stock: { $gte: purchasedQuantity } },
      { $inc: { stock: -purchasedQuantity }, $set: { updatedAt: new Date() } },
      { new: true }
    );
    if (!result) {
      console.error(`Аксессуар ${accessoryId} не найден или недостаточно остатка`);
      return false;
    }
    console.log(`✅ Аксессуар ${result.title}: -${purchasedQuantity}, остаток: ${result.stock}`);
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
