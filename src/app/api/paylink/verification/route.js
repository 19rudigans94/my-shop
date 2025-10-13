import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import sendEmail from "@/app/utils/sendEmail";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");
    const paymentId = searchParams.get("paymentId");
    const amount = searchParams.get("amount");

    console.log("🔍 Verification request:", {
      status,
      uid,
      token,
      paymentId,
      amount,
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
          uid: updatedOrder.uid,
          status: updatedOrder.status,
          email: updatedOrder.contactData.email,
        });

        // Отправляем email с подтверждением
        try {
          await sendEmail(updatedOrder);
          console.log("📧 Email отправлен успешно");
        } catch (emailError) {
          console.error("❌ Ошибка отправки email:", emailError);
          // Не прерываем процесс, если email не отправился
        }

        // Перенаправляем на страницу успеха с данными заказа
        return NextResponse.redirect(
          new URL(
            `/success?uid=${uid}&amount=${updatedOrder.totalPrice}`,
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
      // Обновляем статус заказа как неуспешный
      await Order.updateStatus(uid, "failed", {
        errorMessage: `Payment status: ${status}`,
        processedAt: new Date(),
      });

      console.log(`❌ Платеж неуспешен. UID: ${uid}, Status: ${status}`);

      // Перенаправляем на страницу ошибки с деталями
      return NextResponse.redirect(
        new URL(
          `/failed?error=payment_failed&message=Платеж не прошел&uid=${uid}`,
          request.url
        )
      );
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
