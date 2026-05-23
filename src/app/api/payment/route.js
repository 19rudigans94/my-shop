import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/shared/lib/email";

export async function POST(request) {
  try {
    const data = await request.json();

    // Здесь будет реальная обработка платежа
    const orderId = Date.now().toString(36);

    // Отправляем email с подтверждением заказа
    const emailSent = await sendOrderConfirmationEmail({
      customer: data.customer,
      order: data.order,
      orderId,
    });

    if (!emailSent) {
      console.error("Не удалось отправить email с подтверждением заказа");
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
