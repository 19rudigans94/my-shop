import { NextResponse } from "next/server";
import {
  sendOrderConfirmationEmail,
  sendManagerNotificationEmail,
} from "@/app/utils/sendEmail";
import connectDB from "@/lib/mongodb";
import DigitalCopy from "@/models/DigitalCopy";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { orderData, paymentId } = await request.json();

    console.log("📧 Запрос на отправку email:", {
      email: orderData.contactData.email,
      itemsCount: orderData.items.length,
      paymentId,
      items: orderData.items.map((item) => ({
        title: item.title,
        id: item.id,
        category: item.category,
        platform: item.platform,
      })),
    });

    // Проверяем переменные окружения для SMTP
    const requiredEnvVars = [
      "NEXT_SMTP_HOST",
      "NEXT_SMTP_PORT",
      "NEXT_SMTP_USER",
      "NEXT_SMTP_PASSWORD",
      "NEXT_FEEDBACK_MAIL",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      console.error("❌ Отсутствуют переменные окружения:", missingVars);
      return NextResponse.json(
        {
          success: false,
          error: `Отсутствуют переменные окружения: ${missingVars.join(", ")}`,
        },
        { status: 500 }
      );
    }

    console.log("✅ SMTP настройки:", {
      host: process.env.NEXT_SMTP_HOST,
      port: process.env.NEXT_SMTP_PORT,
      user: process.env.NEXT_SMTP_USER ? "✅ Установлен" : "❌ Не установлен",
      password: process.env.NEXT_SMTP_PASSWORD
        ? "✅ Установлен"
        : "❌ Не установлен",
      from: process.env.NEXT_FEEDBACK_MAIL,
    });

    // Тестируем соединение с SMTP сервером
    try {
      const testTransporter = nodemailer.createTransport({
        host: process.env.NEXT_SMTP_HOST,
        port: process.env.NEXT_SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.NEXT_SMTP_USER,
          pass: process.env.NEXT_SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await testTransporter.verify();
      console.log("✅ SMTP соединение успешно проверено");
    } catch (smtpError) {
      console.error("❌ Ошибка соединения с SMTP сервером:", {
        error: smtpError.message,
        code: smtpError.code,
        command: smtpError.command,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Ошибка SMTP соединения: ${smtpError.message}`,
        },
        { status: 500 }
      );
    }

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

      // Проверяем, является ли товар потенциально цифровым (игра с платформой)
      if (item.category === "games" && item.platform) {
        console.log(`🔍 Проверка цифровых ключей для игры:`, {
          title: item.title,
          id: item.id,
          platform: item.platform,
          quantity: item.quantity,
        });

        // Ищем цифровые ключи для этой игры
        try {
          // Ищем цифровые копии по gameId (ObjectId)
          let digitalCopies = await DigitalCopy.find({
            gameId: item.id,
            platform: item.platform,
            isActive: true,
          }).limit(item.quantity);

          console.log(
            `🔑 Найдено цифровых копий: ${digitalCopies.length} из ${item.quantity} нужных`
          );

          if (digitalCopies.length >= item.quantity) {
            hasDigitalItems = true;

            // Получаем доступные аккаунты (credentials) из найденных копий
            const availableCredentials = [];

            for (const copy of digitalCopies.slice(0, item.quantity)) {
              // Берем активные credentials из каждой копии
              const activeCredentials = copy.credentials.filter(
                (cred) => cred.isActive
              );

              if (activeCredentials.length > 0) {
                // Берем первый доступный аккаунт
                const credential = activeCredentials[0];
                availableCredentials.push({
                  login: credential.login,
                  password: credential.password,
                  platform: copy.platform,
                });

                // Помечаем credential как использованный
                credential.isActive = false;
                await copy.save();
              }
            }

            if (availableCredentials.length > 0) {
              // Добавляем аккаунты к товару
              processedItem.digitalKeys = availableCredentials;

              console.log(
                `🔑 Выдано ${availableCredentials.length} аккаунтов для ${item.title}`
              );
            } else {
              console.warn(
                `⚠️ Нет доступных аккаунтов в найденных копиях для ${item.title}`
              );
              hasPhysicalItems = true; // Обрабатываем как физический товар
            }
          } else {
            console.warn(
              `⚠️ Недостаточно цифровых копий для ${item.title}. Нужно: ${item.quantity}, доступно: ${digitalCopies.length}`
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

    // Логируем итоговые результаты анализа товаров
    console.log("📊 Анализ товаров завершен:", {
      hasDigitalItems,
      hasPhysicalItems,
      totalItems: processedItems.length,
      digitalItemsCount: processedItems.filter((item) => item.digitalKeys)
        .length,
      physicalItemsCount: processedItems.filter((item) => !item.digitalKeys)
        .length,
    });

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
