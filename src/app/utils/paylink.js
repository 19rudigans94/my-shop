/**
 * Клиентская утилита для работы с PayLink через серверное API
 *
 * Отправляет данные корзины на серверный endpoint /api/paylink,
 * который создает продукт в PayLink и возвращает ссылку для оплаты
 */

export const createPayLinkProduct = async (cartData, retryCount = 0) => {
  const MAX_RETRIES = 2;

  console.log(
    `🚀 createPayLinkProduct: отправка данных корзины (попытка ${
      retryCount + 1
    }/${MAX_RETRIES + 1})`,
    cartData
  );

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

      // Если это серверная ошибка и у нас есть попытки повтора
      if (
        (response.status >= 500 || response.status === 502) &&
        retryCount < MAX_RETRIES
      ) {
        console.log(
          `🔄 Повторная попытка через ${(retryCount + 1) * 2} секунд... (${
            retryCount + 1
          }/${MAX_RETRIES})`
        );
        // Увеличиваем задержку с каждой попыткой
        await new Promise((resolve) =>
          setTimeout(resolve, (retryCount + 1) * 2000)
        );
        return createPayLinkProduct(cartData, retryCount + 1);
      }

      throw new Error(
        errorData.error || "Ошибка при создании ссылки для оплаты"
      );
    }

    const result = await response.json();
    console.log(`✅ Успешный результат (попытка ${retryCount + 1}):`, result);

    // API возвращает { success: true, data: { id, pay_url, ... } }
    if (result.success && result.data) {
      return result.data; // Возвращаем объект с pay_url
    } else {
      throw new Error("Неправильный формат ответа от сервера");
    }
  } catch (error) {
    console.error(
      `💥 Ошибка в createPayLinkProduct (попытка ${retryCount + 1}):`,
      error
    );

    // Если это сетевая ошибка и у нас есть попытки повтора
    if (
      (error.name === "TypeError" ||
        error.message.includes("Failed to fetch")) &&
      retryCount < MAX_RETRIES
    ) {
      console.log(
        `🔄 Повторная попытка из-за сетевой ошибки через 1 секунду... (${
          retryCount + 1
        }/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createPayLinkProduct(cartData, retryCount + 1);
    }

    throw error;
  }
};
