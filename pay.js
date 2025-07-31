// рабочий код для создания продукта в Paylink

/**
 * Создаёт продукт в системе PayLink.kz через серверный API и возвращает ссылку на оплату.
 *
 * 📌 Используется при оформлении заказа для генерации платёжной ссылки.
 * 🔐 НЕ требует клиентских переменных окружения, так как обращается к серверному API.
 * 🛡️ Безопасно: секретные данные PayLink хранятся только на сервере.
 * 🌐 Решает проблему CORS: запрос к PayLink выполняется с сервера.
 *
 * Серверные переменные окружения (нужны в .env.local):
 *    - PAYLINK_SHOP_ID (без NEXT_PUBLIC_)
 *    - PAYLINK_SHOP_SECRET (без NEXT_PUBLIC_)
 *    - PAYLINK_RETURN_URL (опционально)
 *
 * @async
 * @function createPayLinkProduct
 *
 * @param {Object} cartData - Данные корзины для создания заказа
 * @param {Array} cartData.items - Массив товаров в корзине
 * @param {number} cartData.totalPrice - Общая сумма заказа в тенге
 * @param {number} cartData.totalItems - Общее количество товаров
 *
 * @returns {Promise<{ pay_url: string, confirm_url: string }>}
 * Возвращает объект с платёжной ссылкой (`pay_url`) и URL подтверждения (`confirm_url`).
 * В случае ошибки выбрасывает исключение с подробным описанием.
 *
 * @throws {Error} При ошибках сервера, неправильной конфигурации или проблемах с PayLink API
 *
 * @example
 * try {
 *   const result = await createPayLinkProduct({
 *     totalPrice: 15000,
 *     totalItems: 2,
 *     items: [
 *       { title: "Игра 1", quantity: 1, price: 10000 },
 *       { title: "Игра 2", quantity: 1, price: 5000 }
 *     ]
 *   });
 *
 *   if (result?.pay_url) {
 *     window.location.href = result.pay_url;
 *   }
 * } catch (error) {
 *   console.error('Ошибка создания платежа:', error.message);
 * }
 */

async function createPayLinkProduct(cartData = {}) {
  console.log("🚀 createPayLinkProduct (клиент) вызван с данными:", cartData);

  try {
    console.log("🌐 Отправка запроса к серверному API...");
    console.log("- URL:", "/api/paylink");
    console.log("- Метод:", "POST");

    const response = await fetch("/api/paylink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartData }),
    });

    console.log("📡 Ответ от серверного API:");
    console.log("- Статус:", response.status, response.statusText);

    const result = await response.json();
    console.log("📊 Полученные данные:", result);

    if (!response.ok || !result.success) {
      console.error("❌ Ошибка от серверного API:");
      console.error("- Статус:", response.status);
      console.error("- Детали:", result.details);
      throw new Error(result.error || "Ошибка при создании ссылки для оплаты");
    }

    console.log("✅ Продукт успешно создан через серверный API:");
    console.log("- ID продукта:", result.data.id);
    console.log("- Ссылка для оплаты:", result.data.pay_url);
    console.log("- Ссылка подтверждения:", result.data.confirm_url);

    return result.data;
  } catch (error) {
    console.error("💥 Ошибка при обращении к серверному API:");
    console.error("- Тип ошибки:", error.name);
    console.error("- Сообщение:", error.message);
    console.error("- Стек:", error.stack);
    throw error; // Пробрасываем ошибку выше для обработки в UI
  }
}

export default createPayLinkProduct;
