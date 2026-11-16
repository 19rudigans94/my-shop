import mongoose from "mongoose";
import connectDB from "@/shared/lib/db/mongodb";
import Console from "@/entities/console/model/schema";
import Accessory from "@/entities/accessory/model/schema";
import Game from "@/entities/game/model/schema";
import DigitalCopy from "@/entities/game/model/digital-copy-schema";
import PhysicalDisk from "@/entities/game/model/physical-disk-schema";

const MAX_LINES = 50;
const MAX_QUANTITY = 99;

export class CartValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "CartValidationError";
  }
}

function assertObjectId(id) {
  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    throw new CartValidationError("Некорректный товар в корзине");
  }
}

function parseQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new CartValidationError("Некорректное количество товара");
  }
  return quantity;
}

async function gameTitle(gameId, fallback) {
  const game = await Game.findById(gameId).select("title").lean();
  return game?.title || fallback || "Игра";
}

async function priceLine(item) {
  const quantity = parseQuantity(item.quantity);
  assertObjectId(item.id);

  const type = item.type || "game";

  if (type === "console" || type === "accessory") {
    const Model = type === "console" ? Console : Accessory;
    const product = await Model.findById(item.id).lean();
    if (!product) throw new CartValidationError("Товар не найден");
    if (typeof product.stock === "number" && product.stock < quantity) {
      throw new CartValidationError(`Недостаточно товара на складе: ${product.title}`);
    }
    return {
      id: product._id.toString(),
      productType: type,
      name: product.title,
      price: product.price,
      quantity,
      platform: type === "accessory" ? product.platform : undefined,
      condition: undefined,
    };
  }

  if (type === "game" && item.variant === "digital") {
    const copy = await DigitalCopy.findById(item.id).lean();
    if (!copy || !copy.isActive) throw new CartValidationError("Цифровая копия не найдена");
    const available = (copy.credentials || []).filter((c) => c.isActive).length;
    if (available < quantity) {
      throw new CartValidationError("Недостаточно цифровых копий в наличии");
    }
    return {
      id: copy._id.toString(),
      productType: "digital",
      name: await gameTitle(copy.gameId, item.title),
      price: copy.price,
      quantity,
      platform: copy.platform,
      condition: undefined,
    };
  }

  if (type === "game") {
    const condition = item.condition === "used" ? "used" : "new";
    if (typeof item.platform !== "string" || !item.platform) {
      throw new CartValidationError("Не указана платформа");
    }
    const disk = await PhysicalDisk.findOne({
      gameId: item.id,
      platform: item.platform,
    }).lean();
    const variant = disk?.variants?.find((v) => v.condition === condition);
    if (!variant) throw new CartValidationError("Диск не найден");
    if (variant.stock < quantity) {
      throw new CartValidationError("Недостаточно дисков на складе");
    }
    return {
      id: disk.gameId.toString(),
      productType: "physical",
      name: await gameTitle(disk.gameId, item.title),
      price: variant.price,
      quantity,
      platform: disk.platform,
      condition,
    };
  }

  throw new CartValidationError("Неизвестный тип товара");
}

/**
 * Пересчитывает корзину по ценам из БД. Цены и итоговая сумма от клиента
 * игнорируются: клиент присылает только id, тип, вариант, платформу,
 * состояние и количество.
 */
export async function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CartValidationError("Корзина пуста");
  }
  if (items.length > MAX_LINES) {
    throw new CartValidationError("Слишком много позиций в корзине");
  }

  await connectDB();

  const lines = [];
  for (const item of items) {
    if (!item || typeof item !== "object") {
      throw new CartValidationError("Некорректный товар в корзине");
    }
    lines.push(await priceLine(item));
  }

  for (const line of lines) {
    if (typeof line.price !== "number" || !Number.isFinite(line.price) || line.price <= 0) {
      throw new CartValidationError(`Некорректная цена товара: ${line.name}`);
    }
  }

  const totalPrice = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

  return { items: lines, totalPrice, totalItems };
}
