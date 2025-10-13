import { NextResponse } from "next/server";
import {
  sendOrderConfirmationEmail,
  sendManagerNotificationEmail,
} from "@/app/utils/sendEmail";
import connectDB from "@/lib/mongodb";
import DigitalCopy from "@/models/DigitalCopy";

export async function POST(request) {
  try {
    const { orderData, paymentId } = await request.json();

    console.log("📧 Запрос на отправку email:", {
      email: orderData.contactData.email,
      itemsCount: orderData.items.length,
      paymentId,
    });

    // Подключаемся к базе данных
    await connectDB();

    // Определяем тип заказа и подготавливаем данные для email
    const processedItems = [];
    let hasDigitalItems = false;
    let hasPhysicalItems = false;

    for (const item of orderData.items) {
      const processedItem = {
        name: item.title,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        category: item.category,
        platform: item.platform,
      };

      // Проверяем, является ли товар цифровым
      if (item.category === "games" && item.platform) {
        hasDigitalItems = true;

        // Ищем цифровые ключи для этой игры
        try {
          const digitalCopies = await DigitalCopy.find({
            gameId: item.id,
            platform: item.platform,
            status: "available",
          }).limit(item.quantity);

          if (digitalCopies.length >= item.quantity) {
            // Добавляем ключи к товару
            processedItem.digitalKeys = digitalCopies.map((copy) => copy.key);

            // Помечаем ключи как проданные
            await DigitalCopy.updateMany(
              { _id: { $in: digitalCopies.map((copy) => copy._id) } },
              {
                status: "sold",
                soldAt: new Date(),
                soldTo: orderData.contactData.email,
                paymentId: paymentId,
              }
            );

            console.log(
              `🔑 Выдано ${digitalCopies.length} ключей для ${item.title}`
            );
          } else {
            console.warn(
              `⚠️ Недостаточно ключей для ${item.title}. Нужно: ${item.quantity}, доступно: ${digitalCopies.length}`
            );
            processedItem.keysAvailable = digitalCopies.length;
            processedItem.keysNeeded = item.quantity;
            hasPhysicalItems = true; // Обрабатываем как физический товар
          }
        } catch (error) {
          console.error(
            `❌ Ошибка при поиске ключей для ${item.title}:`,
            error
          );
          hasPhysicalItems = true; // Обрабатываем как физический товар при ошибке
        }
      } else {
        hasPhysicalItems = true;
      }

      processedItems.push(processedItem);
    }

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
        hasDigitalItems,
        hasPhysicalItems,
        paymentId,
        orderDate: orderData.orderDate,
      },
      orderId: paymentId || `ORDER-${Date.now()}`,
    };

    // Отправляем email клиенту
    const customerEmailSent = await sendOrderConfirmationEmail(emailData);

    // Отправляем email менеджеру
    const managerEmailSent = await sendManagerNotificationEmail(emailData);

    const results = {
      customerEmail: customerEmailSent,
      managerEmail: managerEmailSent,
    };

    console.log("📧 Результаты отправки email:", results);

    if (customerEmailSent || managerEmailSent) {
      return NextResponse.json({
        success: true,
        message: "Email отправлены",
        results,
        hasDigitalItems,
        hasPhysicalItems,
      });
    } else {
      throw new Error("Не удалось отправить ни одно письмо");
    }
  } catch (error) {
    console.error("❌ Ошибка при отправке email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Ошибка при отправке email",
      },
      { status: 500 }
    );
  }
}
