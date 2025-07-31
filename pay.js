// рабочий код для создания продукта в Paylink

/**
 * Создаёт продукт в системе PayLink.kz и возвращает ссылку на оплату.
 *
 * 📌 Используется при оформлении заказа для генерации платёжной ссылки.
 * 🔐 Требуется корректная авторизация с использованием переменных окружения:
 *    - NEXT_PUBLIC_PAYLINK_SHOP_ID
 *    - NEXT_PUBLIC_PAYLINK_SHOP_SECRET
 *    - NEXT_PUBLIC_PAYLINK_RETURN_URL
 *
 * @async
 * @function createPayLinkProduct
 *
 * @param {Object} cartData - Данные корзины для создания заказа
 * @param {Array} cartData.items - Массив товаров в корзине
 * @param {number} cartData.totalPrice - Общая сумма заказа в тенге
 * @param {number} cartData.totalItems - Общее количество товаров
 *
 * @returns {Promise<{ pay_url: string, confirm_url: string } | null>}
 * Возвращает объект с платёжной ссылкой (`pay_url`) и URL подтверждения (`confirm_url`),
 * либо `null` в случае ошибки (например, при некорректной авторизации).
 *
 * @example
 * const result = await createPayLinkProduct({
 *   totalPrice: 15000,
 *   totalItems: 2,
 *   items: [
 *     { title: "Игра 1", quantity: 1, price: 10000 },
 *     { title: "Игра 2", quantity: 1, price: 5000 }
 *   ]
 * });
 *
 * if (result?.pay_url) {
 *   window.location.href = result.pay_url;
 * }
 */

async function createPayLinkProduct(cartData = {}) {
  console.log("createPayLinkProduct", cartData);

  // Получаем данные из переменных окружения или используем тестовые
  const shopSecret = process.env.NEXT_PUBLIC_PAYLINK_SHOP_SECRET;
  const shopId = process.env.NEXT_PUBLIC_PAYLINK_SHOP_ID;

  const baseData = {
    currency: "KZT",
    infinite: true,
    test: true, // В продакшене должно быть false
    immortal: true,
    return_url:
      process.env.NEXT_PUBLIC_PAYLINK_RETURN_URL || "https://goldgames.kz",
    shop_id: shopId,
    language: "ru",
    transaction_type: "payment",
  };

  // Формируем описание заказа на основе товаров в корзине
  const orderDescription =
    cartData.items && cartData.items.length > 0
      ? `Заказ: ${cartData.items
          .map((item) => `${item.title} (${item.quantity}шт)`)
          .join(", ")}`
      : "Заказ из интернет-магазина";

  const orderName =
    cartData.totalItems > 1
      ? `Заказ из ${cartData.totalItems} товар${
          cartData.totalItems > 4 ? "ов" : cartData.totalItems > 1 ? "а" : ""
        }`
      : cartData.items?.[0]?.title || "Покупка в интернет-магазине";

  const payload = {
    name: orderName,
    description: orderDescription,
    amount: (cartData.totalPrice || 100000).toString(),
    ...baseData,
  };

  try {
    const response = await fetch("https://api.paylink.kz/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${shopId}:${shopSecret}`).toString(
          "base64"
        )}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Ошибка при создании продукта:", error);
      return null;
    }

    const result = await response.json();
    console.log("Продукт создан:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    return null;
  }
}

export default createPayLinkProduct;
