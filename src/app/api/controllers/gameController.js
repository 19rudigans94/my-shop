import { ensureDbConnection } from "../../utils/dbConnection";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  dataResponse,
} from "../../utils/responseHandler";
import * as gameService from "../services/gameService";

/**
 * GET /api/games - Получить список всех игр
 */
export async function getAllGames() {
  try {
    await ensureDbConnection();
    const games = await gameService.getAllGames();
    return dataResponse(games);
  } catch (error) {
    console.error("Ошибка при получении списка игр:", error);
    return errorResponse("Ошибка при получении списка игр", 500);
  }
}

/**
 * GET /api/games/[slug] - Получить игру по slug
 */
export async function getGameBySlug(request, { params }) {
  try {
    await ensureDbConnection();
    const { slug } = await params;
    const game = await gameService.getGameBySlug(slug);

    if (!game) {
      return notFoundResponse("Игра не найдена");
    }

    return successResponse({ game });
  } catch (error) {
    console.error("Ошибка при получении игры:", error);
    return errorResponse(error.message || "Ошибка при получении игры", 500);
  }
}

/**
 * POST /api/games - Создать новую игру
 */
export async function createGame(request) {
  try {
    await ensureDbConnection();
    const data = await request.json();
    const game = await gameService.createGame(data);
    return successResponse({ game }, 201);
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    return errorResponse(error.message || "Ошибка при создании игры", 500);
  }
}

/**
 * GET /api/protected/games - Получить список игр (защищенный)
 */
export async function getAllGamesProtected() {
  try {
    await ensureDbConnection();
    const games = await gameService.getAllGames();
    return successResponse({ games });
  } catch (error) {
    console.error("Ошибка при получении игр:", error);
    return errorResponse(
      error.message || "Ошибка при получении игр из базы данных",
      500
    );
  }
}

/**
 * GET /api/protected/games/[id] - Получить игру по ID (защищенный)
 */
export async function getGameByIdProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    const game = await gameService.getGameById(id);

    if (!game) {
      return notFoundResponse("Игра не найдена");
    }

    return successResponse({ game });
  } catch (error) {
    console.error("Ошибка при получении игры:", error);
    return errorResponse(error.message || "Ошибка при получении игры", 500);
  }
}

/**
 * POST /api/protected/games - Создать новую игру (защищенный)
 */
export async function createGameProtected(request) {
  try {
    await ensureDbConnection();
    const data = await request.json();
    const { game, physicalDisks } = await gameService.createGame(data);
    return successResponse({ game, physicalDisks });
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    return errorResponse(error.message || "Ошибка при создании игры", 500);
  }
}

/**
 * PUT /api/protected/games/[id] - Обновить игру (защищенный)
 */
export async function updateGameProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    const data = await request.json();
    const game = await gameService.updateGame(id, data);
    return successResponse({ game });
  } catch (error) {
    console.error("Ошибка при обновлении игры:", error);
    if (error.message === "Игра не найдена") {
      return notFoundResponse(error.message);
    }
    return errorResponse(error.message || "Ошибка при обновлении игры", 500);
  }
}

/**
 * DELETE /api/protected/games/[id] - Удалить игру (защищенный)
 */
export async function deleteGameProtected(request, { params }) {
  try {
    await ensureDbConnection();
    const { id } = await params;
    await gameService.deleteGame(id);
    return successResponse({ message: "Игра успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении игры:", error);
    if (error.message === "Игра не найдена") {
      return notFoundResponse(error.message);
    }
    return errorResponse(error.message || "Ошибка при удалении игры", 500);
  }
}
