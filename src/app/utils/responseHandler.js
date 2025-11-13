import { NextResponse } from "next/server";

/**
 * Успешный ответ
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}

/**
 * Ошибка
 */
export function errorResponse(message, status = 500, error = null) {
  const response = {
    success: false,
    error: message || "Внутренняя ошибка сервера",
  };

  if (error && process.env.NODE_ENV === "development") {
    response.details = error.message;
  }

  return NextResponse.json(response, { status });
}

/**
 * Ответ с данными (для публичных API без поля success)
 */
export function dataResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Ответ 404
 */
export function notFoundResponse(message = "Ресурс не найден") {
  return errorResponse(message, 404);
}

/**
 * Ответ 400 (некорректный запрос)
 */
export function badRequestResponse(message = "Некорректный запрос") {
  return errorResponse(message, 400);
}
