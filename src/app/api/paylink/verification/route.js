import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

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

    if (status === "successful") {
      console.log("✅ Успешный платеж, перенаправляем на success");
      console.log(
        "📧 Email будет отправлен на странице success на основе данных из localStorage"
      );

      // Пытаемся найти и обновить заказ в базе данных (необязательно)
      try {
        await connectDB();
        const order = await Order.findByUid(uid);

        if (order) {
          const updatedOrder = await Order.updateStatus(uid, "successful", {
            paymentId,
            amount: amount ? parseFloat(amount) : order.totalPrice,
            processedAt: new Date(),
          });

          console.log("✅ Заказ найден и обновлен в БД:", {
            id: updatedOrder.unifiedId,
            status: updatedOrder.unifiedStatus,
          });

          // Перенаправляем на страницу успеха с данными из БД
          return NextResponse.redirect(
            new URL(
              `/success?uid=${uid}&amount=${updatedOrder.unifiedTotalPrice}&paymentId=${paymentId}`,
              request.url
            )
          );
        } else {
          console.log(
            "⚠️ Заказ не найден в БД, но это не критично - используем localStorage"
          );
        }
      } catch (dbError) {
        console.error("❌ Ошибка работы с БД (не критично):", dbError);
      }

      // Перенаправляем на success в любом случае - данные будут взяты из localStorage
      return NextResponse.redirect(
        new URL(
          `/success?uid=${uid}&amount=${amount}&paymentId=${paymentId}`,
          request.url
        )
      );
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

      // Пытаемся обновить статус заказа как неуспешный (необязательно)
      try {
        await connectDB();
        const order = await Order.findByUid(uid);
        if (order) {
          await Order.updateStatus(uid, "failed", {
            errorMessage: `Payment status: ${status}, Error code: ${errorCode}, Message: ${errorMessage}`,
            paymentData: {
              errorCode,
              errorMessage,
              status,
            },
            processedAt: new Date(),
          });
          console.log("✅ Статус заказа обновлен в БД как неуспешный");
        }
      } catch (dbError) {
        console.error(
          "❌ Ошибка обновления статуса в БД (не критично):",
          dbError
        );
      }

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
