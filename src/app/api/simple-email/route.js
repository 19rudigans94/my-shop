import { NextResponse } from "next/server";
import {
  sendOrderConfirmationEmail,
  sendManagerNotificationEmail,
} from "@/app/utils/sendEmail";

export async function POST(request) {
  try {
    console.log("📧 Simple email API вызван");

    const { orderData, paymentId } = await request.json();

    console.log("📧 Получены данные заказа:", {
      email: orderData.contactData?.email,
      itemsCount: orderData.items?.length || 0,
      paymentId,
    });

    // Простая обработка без поиска в базе данных
    const processedItems = orderData.items.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      price: item.price || 0,
      total: item.total || item.price * item.quantity,
      category: item.category,
      platform: item.platform,
      // Пока обрабатываем все как физические товары
      digitalKeys: null,
    }));

    // Формируем данные для email
    const emailData = {
      customer: {
        name: orderData.contactData.email.split("@")[0],
        phone: orderData.contactData.phone,
        email: orderData.contactData.email,
      },
      order: {
        items: processedItems,
        totalAmount: orderData.totalPrice,
        hasDigitalItems: false, // Пока false для простоты
        hasPhysicalItems: true, // Всегда true для простоты
        paymentId,
        orderDate: orderData.orderDate || new Date().toLocaleString("ru-RU"),
      },
      orderId: paymentId || `ORDER-${Date.now()}`,
    };

    console.log("📤 Отправка email клиенту...");
    const customerEmailSent = await sendOrderConfirmationEmail(emailData);
    console.log("📤 Результат email клиенту:", customerEmailSent);

    console.log("📤 Отправка email менеджеру...");
    const managerEmailSent = await sendManagerNotificationEmail(emailData);
    console.log("📤 Результат email менеджеру:", managerEmailSent);

    const results = {
      customerEmail: customerEmailSent,
      managerEmail: managerEmailSent,
    };

    console.log("📧 Итоговые результаты:", results);

    return NextResponse.json({
      success: true,
      message: "Simple email отправлены",
      results,
      emailData: {
        customer: emailData.customer,
        orderSummary: {
          itemsCount: emailData.order.items.length,
          totalAmount: emailData.order.totalAmount,
          orderId: emailData.orderId,
        },
      },
    });
  } catch (error) {
    console.error("❌ Ошибка в simple email API:", error);
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
