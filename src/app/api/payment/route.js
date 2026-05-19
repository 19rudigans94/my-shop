import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/app/utils/sendEmail";

export async function POST(request) {
  try {
    const data = await request.json();

    // Выводим данные в консоль для отладки
    console.log("Получены данные заказа:", {
      customer: data.customer,
      payment: {
        ...data.payment,
        cardNumber: data.payment.cardNumber.replace(/\d(?=\d{4})/g, "*"), // Маскируем номер карты
        cvv: "***", // Маскируем CVV
      },
      order: data.order.items,
      totalItems: data.order.totalItems,
      totalAmount: data.order.totalAmount,
      timestamp: data.timestamp,
    });

    // Здесь будет реальная обработка платежа
    // Пока просто имитируем успешный ответ
    const orderId = Date.now().toString(36);

    // Отправляем email с подтверждением заказа
    const emailSent = await sendOrderConfirmationEmail({
      customer: data.customer,
      order: data.order,
      orderId,
    });

    if (!emailSent) {
      console.warn("Не удалось отправить email с подтверждением заказа");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Заказ успешно оформлен",
        orderId,
        orderDetails: {
          customer: data.customer,
          order: data.order,
          timestamp: data.timestamp,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при обработке платежа:", error);
    return NextResponse.json(
      { success: false, message: "Произошла ошибка при обработке платежа" },
      { status: 500 }
    );
  }
}
