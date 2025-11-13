import { ensureDbConnection } from "../../utils/dbConnection";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  dataResponse,
} from "../../utils/responseHandler";
import * as consoleService from "../services/consoleService";

/**
 * GET /api/consoles - Получить список всех консолей
 */
export async function getAllConsoles() {
  try {
    await ensureDbConnection();
    const consoles = await consoleService.getAllConsoles();
    return dataResponse(consoles);
  } catch (error) {
    console.error("Ошибка при получении списка консолей:", error);
    console.error("Stack trace:", error.stack);
    return errorResponse(
      error?.message || "Ошибка при получении списка консолей",
      500
    );
  }
}

/**
 * GET /api/consoles/[slug] - Получить консоль по slug
 */
export async function getConsoleBySlug(request, { params }) {
  try {
    await ensureDbConnection();

    if (!params) {
      return errorResponse("Параметры запроса не получены", 400);
    }

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return errorResponse("Не указан slug консоли", 400);
    }

    const consoleItem = await consoleService.getConsoleBySlug(slug);

    if (!consoleItem) {
      return notFoundResponse("Консоль не найдена");
    }

    return successResponse({ console: consoleItem });
  } catch (error) {
    console.error("Ошибка при получении консоли:", error);
    console.error("Stack trace:", error.stack);
    return errorResponse(error?.message || "Ошибка при получении консоли", 500);
  }
}

/**
 * POST /api/consoles - Создать новую консоль
 */
export async function createConsole(request) {
  try {
    await ensureDbConnection();
    const data = await request.json();
    const consoleItem = await consoleService.createConsole(data);
    return successResponse({ console: consoleItem }, 201);
  } catch (error) {
    console.error("Ошибка при создании консоли:", error);
    return errorResponse(error.message || "Ошибка при создании консоли", 500);
  }
}

/**
 * GET /api/protected/consoles - Получить список консолей (защищенный)
 */
export async function getAllConsolesProtected() {
  try {
    await ensureDbConnection();
    const consoles = await consoleService.getAllConsoles();
    return successResponse({ consoles });
  } catch (error) {
    console.error("Ошибка при получении консолей:", error);
    return errorResponse(
      error.message || "Ошибка при получении консолей из базы данных",
      500
    );
  }
}

/**
 * GET /api/protected/consoles/[id] - Получить консоль по ID (защищенный)
 */
export async function getConsoleByIdProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    const consoleItem = await consoleService.getConsoleById(id);

    if (!consoleItem) {
      return notFoundResponse("Консоль не найдена");
    }

    return successResponse({ console: consoleItem });
  } catch (error) {
    console.error("Ошибка при получении консоли:", error);
    return errorResponse(error.message || "Ошибка при получении консоли", 500);
  }
}

/**
 * POST /api/protected/consoles - Создать новую консоль (защищенный)
 */
export async function createConsoleProtected(request) {
  try {
    await ensureDbConnection();
    const data = await request.json();
    const consoleItem = await consoleService.createConsole(data);
    return successResponse({ console: consoleItem });
  } catch (error) {
    console.error("Ошибка при создании консоли:", error);
    return errorResponse(error.message || "Ошибка при создании консоли", 500);
  }
}

/**
 * PUT /api/protected/consoles/[id] - Обновить консоль (защищенный)
 */
export async function updateConsoleProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    const data = await request.json();
    const consoleItem = await consoleService.updateConsole(id, data);
    return successResponse({ console: consoleItem });
  } catch (error) {
    console.error("Ошибка при обновлении консоли:", error);
    if (error.message === "Консоль не найдена") {
      return notFoundResponse(error.message);
    }
    return errorResponse(error.message || "Ошибка при обновлении консоли", 500);
  }
}

/**
 * DELETE /api/protected/consoles/[id] - Удалить консоль (защищенный)
 */
export async function deleteConsoleProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    await consoleService.deleteConsole(id);
    return successResponse({ message: "Консоль успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении консоли:", error);
    if (error.message === "Консоль не найдена") {
      return notFoundResponse(error.message);
    }
    return errorResponse(error.message || "Ошибка при удалении консоли", 500);
  }
}
