/**
 * Клиентская утилита для работы с PayLink через серверное API
 *
 * Отправляет данные корзины на серверный endpoint /api/paylink,
 * который создает продукт в PayLink и возвращает ссылку для оплаты
 */

export const createPayLinkProduct = async (cartData) => {
  console.log("🚀 createPayLinkProduct: отправка данных корзины", cartData);

  try {
    const response = await fetch("/api/paylink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartData }),
    });

    console.log("📡 Ответ от сервера:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Ошибка сервера:", errorData);
      throw new Error(
        errorData.error || "Ошибка при создании ссылки для оплаты"
      );
    }

    const result = await response.json();
    console.log("✅ Успешный результат:1", result);

    // API возвращает { success: true, data: { id, pay_url, ... } }
    if (result.success && result.data) {
      return result.data; // Возвращаем объект с pay_url
    } else {
      throw new Error("Неправильный формат ответа от сервера");
    }
  } catch (error) {
    console.error("💥 Ошибка в createPayLinkProduct:", error);
    throw error;
  }
};
