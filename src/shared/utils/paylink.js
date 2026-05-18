export const createPayLinkProduct = async (cartData) => {
  console.log("🚀 Отправка данных в PayLink API:", cartData);

  const response = await fetch("/api/paylink", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cartData }),
  });

  console.log("📡 Статус ответа:", response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ Ошибка от сервера:", errorData);
    throw new Error(errorData.error || "Ошибка при создании ссылки для оплаты");
  }

  const result = await response.json();
  console.log("✅ Успешный результат:", result);

  if (result.success && result.data) {
    return result.data;
  } else {
    throw new Error("Неправильный формат ответа от сервера");
  }
};
