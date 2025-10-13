import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendOrderConfirmationEmail } from "@/app/utils/sendEmail";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");
    const paymentId = searchParams.get("paymentId");
    const amount = searchParams.get("amount");
    const errorCode = searchParams.get("error_code");
    const errorMessage = searchParams.get("error_message");

    console.log("🔍 Verification request:", {
      status,
      uid,
      token,
      paymentId,
      amount,
      errorCode,
      errorMessage,
    });

    if (!uid) {
      console.error("❌ UID не предоставлен");
      return NextResponse.redirect(
        new URL(
          "/failed?error=invalid_request&message=Отсутствует идентификатор заказа",
          request.url
        )
      );
    }

    // Подключаемся к базе данных
    await connectDB();

    // Ищем заказ в базе данных
    const order = await Order.findByUid(uid);

    if (!order) {
      console.error(`❌ Заказ с UID ${uid} не найден в базе данных`);
      return NextResponse.redirect(
        new URL(
          "/failed?error=order_not_found&message=Заказ не найден",
          request.url
        )
      );
    }

    if (status === "successful") {
      try {
        // Обновляем статус заказа в базе данных
        const updatedOrder = await Order.updateStatus(uid, "successful", {
          paymentId,
          amount: amount ? parseFloat(amount) : order.totalPrice,
          processedAt: new Date(),
        });

        console.log("✅ Заказ успешно обновлен:", {
          id: updatedOrder.unifiedId,
          status: updatedOrder.unifiedStatus,
          email: updatedOrder.unifiedEmail,
        });

        // Отправляем email с подтверждением
        try {
          // Адаптируем данные заказа под формат, ожидаемый функцией sendOrderConfirmationEmail
          const emailData = {
            customer: {
              name:
                updatedOrder.customerInfo?.name ||
                updatedOrder.unifiedEmail.split("@")[0], // Используем имя или часть email
              phone: updatedOrder.unifiedPhone,
              email: updatedOrder.unifiedEmail,
            },
            order: {
              items: updatedOrder.items.map((item) => ({
                name: item.title || item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
              })),
              totalAmount: updatedOrder.unifiedTotalPrice,
            },
            orderId: updatedOrder.unifiedId,
          };

          await sendOrderConfirmationEmail(emailData);
          console.log("📧 Email отправлен успешно");
        } catch (emailError) {
          console.error("❌ Ошибка отправки email:", emailError);
          // Не прерываем процесс, если email не отправился
        }

        // Перенаправляем на страницу успеха с данными заказа
        return NextResponse.redirect(
          new URL(
            `/success?uid=${uid}&amount=${updatedOrder.unifiedTotalPrice}`,
            request.url
          )
        );
      } catch (updateError) {
        console.error("❌ Ошибка обновления заказа:", updateError);
        return NextResponse.redirect(
          new URL(
            "/failed?error=update_failed&message=Ошибка обновления заказа",
            request.url
          )
        );
      }
    } else {
      // Определяем тип ошибки на основе статуса и кода ошибки
      let errorType = "payment_failed";
      let userMessage = "Платеж не прошел";

      // Обработка специфичных кодов ошибок PayLink
      if (errorCode) {
        switch (errorCode) {
          case "F.0998":
            errorType = "payment_cancelled";
            userMessage = "Платеж отменен или не завершен";
            break;
          case "F.0001":
            errorType = "insufficient_funds";
            userMessage = "Недостаточно средств на карте";
            break;
          case "F.0002":
            errorType = "card_declined";
            userMessage = "Карта отклонена банком";
            break;
          case "F.0003":
            errorType = "expired_card";
            userMessage = "Срок действия карты истек";
            break;
          case "F.0004":
            errorType = "invalid_card";
            userMessage = "Неверные данные карты";
            break;
          default:
            userMessage = errorMessage || "Платеж не прошел";
        }
      }

      // Обновляем статус заказа как неуспешный с детальной информацией
      await Order.updateStatus(uid, "failed", {
        errorMessage: `Payment status: ${status}, Error code: ${errorCode}, Message: ${errorMessage}`,
        paymentData: {
          errorCode,
          errorMessage,
          status,
        },
        processedAt: new Date(),
      });

      console.log(
        `❌ Платеж неуспешен. UID: ${uid}, Status: ${status}, Error: ${errorCode}`
      );

      // Перенаправляем на страницу ошибки с детальными данными
      const failedUrl = new URL("/failed", request.url);
      failedUrl.searchParams.set("error", errorType);
      failedUrl.searchParams.set("message", userMessage);
      failedUrl.searchParams.set("uid", uid);
      if (errorCode) failedUrl.searchParams.set("code", errorCode);

      return NextResponse.redirect(failedUrl);
    }
  } catch (error) {
    console.error("❌ Критическая ошибка в verification:", error);
    return NextResponse.redirect(
      new URL(
        "/failed?error=system_error&message=Системная ошибка",
        request.url
      )
    );
  }
}
