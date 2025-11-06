import { successResponse, errorResponse } from "../../utils/responseHandler";
import * as payLinkService from "../services/payLinkService";

/**
 * POST /api/paylink - Создать платежную ссылку
 */
export async function createPayLink(request) {
  try {
    const { cartData } = await request.json();

    console.log("📦 Данные корзины:", JSON.stringify(cartData, null, 2));

    if (cartData.contactData) {
      console.log("📞 Контактные данные:", {
        phone: cartData.contactData.phone,
        email: cartData.contactData.email,
      });
    }

    const result = await payLinkService.createPayLink(cartData, request);

    console.log("✅ Платежная ссылка создана:", result.uid);

    return successResponse({ data: result });
  } catch (error) {
    console.error("❌ Ошибка при создании платежной ссылки:", error);

    let errorMessage = error.message;
    let statusCode = 500;

    if (error.message.includes("переменные окружения")) {
      statusCode = 500;
    } else {
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError;
      } catch (e) {
        // Оставляем исходное сообщение
      }
    }

    return errorResponse(errorMessage, statusCode);
  }
}
