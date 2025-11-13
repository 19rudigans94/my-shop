import { ensureDbConnection } from "../../utils/dbConnection";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "../../utils/responseHandler";
import * as accessoryService from "../services/accessoryService";

/**
 * GET /api/accessories - Получить список аксессуаров с пагинацией
 */
export async function getAccessoriesWithPagination(request) {
  try {
    await ensureDbConnection();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    // Формируем объект фильтров
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page" && key !== "limit" && value && value !== "all") {
        filters[key] = value;
      }
    }

    const { accessories, pagination } =
      await accessoryService.getAccessoriesWithPagination(filters, {
        page,
        limit,
      });

    return successResponse({
      accessories: accessories || [],
      pagination,
    });
  } catch (error) {
    console.error("Ошибка при получении списка аксессуаров:", error);
    return errorResponse(
      error.message || "Ошибка при получении списка аксессуаров",
      500
    );
  }
}

/**
 * GET /api/accessories/[slug] - Получить аксессуар по slug
 */
export async function getAccessoryBySlug(request, { params }) {
  try {
    await ensureDbConnection();
    const { slug } = await params;

    if (!slug) {
      return errorResponse("Не указан slug аксессуара", 400);
    }

    const accessory = await accessoryService.getAccessoryBySlug(slug);

    if (!accessory) {
      return notFoundResponse("Аксессуар не найден");
    }

    return successResponse({ accessory });
  } catch (error) {
    console.error("Ошибка при получении аксессуара:", error);
    return errorResponse(
      error.message || "Ошибка при получении аксессуара",
      500
    );
  }
}

/**
 * POST /api/accessories - Создать новый аксессуар
 */
export async function createAccessory(request) {
  try {
    await ensureDbConnection();
    const data = await request.json();
    const accessory = await accessoryService.createAccessory(data);
    return successResponse({ accessory }, 201);
  } catch (error) {
    console.error("Ошибка при создании аксессуара:", error);
    return errorResponse(
      error.message || "Ошибка при создании аксессуара",
      500
    );
  }
}

/**
 * GET /api/protected/accessories - Получить список аксессуаров (защищенный)
 */
export async function getAllAccessoriesProtected() {
  try {
    await ensureDbConnection();
    const accessories = await accessoryService.getAllAccessories();
    return successResponse({ accessories });
  } catch (error) {
    console.error("Ошибка при получении аксессуаров:", error);
    return errorResponse(
      error.message || "Ошибка при получении аксессуаров из базы данных",
      500
    );
  }
}

/**
 * GET /api/protected/accessories/[id] - Получить аксессуар по ID (защищенный)
 */
export async function getAccessoryByIdProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    const accessory = await accessoryService.getAccessoryById(id);

    if (!accessory) {
      return notFoundResponse("Аксессуар не найден");
    }

    return successResponse({ accessory });
  } catch (error) {
    console.error("Ошибка при получении аксессуара:", error);
    return errorResponse(
      error.message || "Ошибка при получении аксессуара",
      500
    );
  }
}

/**
 * POST /api/protected/accessories - Создать новый аксессуар (защищенный)
 */
export async function createAccessoryProtected(request) {
  try {
    await ensureDbConnection();
    const data = await request.json();
    const accessory = await accessoryService.createAccessory(data);
    return successResponse({ accessory });
  } catch (error) {
    console.error("Ошибка при создании аксессуара:", error);
    return errorResponse(
      error.message || "Ошибка при создании аксессуара",
      500
    );
  }
}

/**
 * PUT /api/protected/accessories/[id] - Обновить аксессуар (защищенный)
 */
export async function updateAccessoryProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    const data = await request.json();
    const accessory = await accessoryService.updateAccessory(id, data);
    return successResponse({ accessory });
  } catch (error) {
    console.error("Ошибка при обновлении аксессуара:", error);
    if (error.message === "Аксессуар не найден") {
      return notFoundResponse(error.message);
    }
    return errorResponse(
      error.message || "Ошибка при обновлении аксессуара",
      500
    );
  }
}

/**
 * DELETE /api/protected/accessories/[id] - Удалить аксессуар (защищенный)
 */
export async function deleteAccessoryProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    await accessoryService.deleteAccessory(id);
    return successResponse({ message: "Аксессуар успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении аксессуара:", error);
    if (error.message === "Аксессуар не найден") {
      return notFoundResponse(error.message);
    }
    return errorResponse(
      error.message || "Ошибка при удалении аксессуара",
      500
    );
  }
}
