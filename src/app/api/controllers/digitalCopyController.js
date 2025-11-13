import { ensureDbConnection } from "../../utils/dbConnection";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} from "../../utils/responseHandler";
import * as digitalCopyService from "../services/digitalCopyService";

/**
 * GET /api/games/[slug]/digital - Получить цифровые копии игры
 */
export async function getDigitalCopiesByGameSlug(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return badRequestResponse("Идентификатор игры не указан");
    }

    const copies = await digitalCopyService.getDigitalCopiesByGameSlug(slug);
    return successResponse({ copies });
  } catch (error) {
    console.error("Ошибка при получении цифровых копий:", error);
    if (error.message === "Игра не найдена") {
      return notFoundResponse(error.message);
    }
    return errorResponse("Ошибка сервера: " + error.message, 500);
  }
}

/**
 * POST /api/admin/add-digital-copy - Добавить цифровую копию
 */
export async function createDigitalCopy(request) {
  try {
    await ensureDbConnection();
    const data = await request.json();
    const digitalCopy = await digitalCopyService.createDigitalCopy(data);
    return successResponse(
      {
        message: "Цифровая копия успешно добавлена",
        data: digitalCopy,
      },
      201
    );
  } catch (error) {
    console.error("Ошибка при добавлении цифровой копии:", error);
    return errorResponse(error.message, 500);
  }
}
