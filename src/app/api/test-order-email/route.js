import { NextResponse } from "next/server";
import {
  sendOrderConfirmationEmail,
  sendManagerNotificationEmail,
} from "@/app/utils/sendEmail";

export async function GET() {
  try {
    console.log("🧪 Тестирование отправки email заказа...");

    // Тестовые данные заказа
    const testOrderData = {
      customer: {
        name: "Тестовый Клиент",
        phone: "+7 777 123 45 67",
        email: "rudi.viktor.94@bk.ru", // Замените на реальный email для теста
      },
      order: {
        items: [
          {
            name: "Detroit: Become Human",
            quantity: 1,
            price: 10,
            total: 10,
            platform: "PS5",
            digitalKeys: null, // Тест физического товара
          },
        ],
        totalAmount: 10,
        hasDigitalItems: false,
        hasPhysicalItems: true,
        paymentId: "TEST-" + Date.now(),
        orderDate: new Date().toLocaleString("ru-RU"),
      },
      orderId: "TEST-ORDER-" + Date.now(),
    };

    console.log("📧 Тестовые данные заказа:", testOrderData);

    // Отправляем email клиенту
    console.log("📤 Отправка email клиенту...");
    const customerEmailSent = await sendOrderConfirmationEmail(testOrderData);

    // Отправляем email менеджеру
    console.log("📤 Отправка email менеджеру...");
    const managerEmailSent = await sendManagerNotificationEmail(testOrderData);

    const results = {
      customerEmail: customerEmailSent,
      managerEmail: managerEmailSent,
    };

    console.log("📧 Результаты отправки тестовых email:", results);

    return NextResponse.json({
      success: true,
      message: "Тестовые email отправлены",
      results,
      testData: testOrderData,
    });
  } catch (error) {
    console.error("❌ Ошибка при тестировании email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
