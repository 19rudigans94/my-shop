import { NextResponse } from "next/server";
import {
  sendCustomerPaymentConfirmation,
  sendStoreOrderNotification,
} from "@/shared/lib/email";

export async function POST(request) {
  try {
    const data = await request.json();

    const orderId = Date.now().toString(36);

    const orderData = {
      customer: data.customer,
      order: data.order,
      orderId,
    };

    const [customerEmailSent, storeEmailSent] = await Promise.all([
      sendCustomerPaymentConfirmation(orderData),
      sendStoreOrderNotification(orderData),
    ]);

    if (!customerEmailSent || !storeEmailSent) {
      console.error("Не удалось отправить один или несколько email с подтверждением заказа");
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
