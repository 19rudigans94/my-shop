/**
 * Валидация email
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Валидация обязательных полей
 */
export function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Не все обязательные поля заполнены: ${missingFields.join(", ")}`
    );
  }
}

/**
 * Нормализация числовых полей
 */
export function normalizeNumericFields(data, fields) {
  const normalized = { ...data };

  fields.forEach((field) => {
    if (
      normalized[field] !== undefined &&
      typeof normalized[field] === "string"
    ) {
      if (field === "price") {
        normalized[field] = parseFloat(normalized[field]);
      } else {
        normalized[field] = parseInt(normalized[field], 10);
      }
    }
  });

  return normalized;
}

/**
 * Проверка на отрицательные значения
 */
export function validateNonNegative(values) {
  for (const [field, value] of Object.entries(values)) {
    if (value !== undefined && value < 0) {
      throw new Error(`${field} не может быть отрицательным`);
    }
  }
}

/**
 * Валидация обратной связи
 */
export function validateFeedback(data) {
  const { name, email, message } = data;

  if (
    !name ||
    typeof name !== "string" ||
    name.length < 2 ||
    name.length > 50
  ) {
    throw new Error("Некорректное имя");
  }

  if (!validateEmail(email)) {
    throw new Error("Некорректный email");
  }

  if (
    !message ||
    typeof message !== "string" ||
    message.length < 10 ||
    message.length > 1000
  ) {
    throw new Error("Сообщение должно быть от 10 до 1000 символов");
  }
}
