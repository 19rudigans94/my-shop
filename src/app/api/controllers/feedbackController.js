import {
  successResponse,
  errorResponse,
  badRequestResponse,
} from "../../utils/responseHandler";
import * as feedbackService from "../services/feedbackService";

/**
 * POST /api/feedback - Отправить обратную связь
 */
export async function sendFeedback(request) {
  if (request.method !== "POST") {
    return errorResponse("Метод не поддерживается", 405);
  }

  try {
    const body = await request.json();
    await feedbackService.sendFeedbackEmail(body);

    return successResponse({ message: "Сообщение успешно отправлено" }, 200);
  } catch (error) {
    console.error("Общая ошибка:", error);

    if (
      error.message.includes("Некорректное") ||
      error.message.includes("Некорректный") ||
      error.message.includes("должно быть")
    ) {
      return badRequestResponse(error.message);
    }

    if (error.message.includes("переменная окружения")) {
      return errorResponse("Ошибка конфигурации сервера", 500);
    }

    if (error.message.includes("отправке сообщения")) {
      return errorResponse("Ошибка при отправке сообщения", 500);
    }

    return errorResponse("Внутренняя ошибка сервера", 500);
  }
}
