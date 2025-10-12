import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/app/utils/sendEmail";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const paymentId = searchParams.get("paymentId");
  const amount = searchParams.get("amount");

  console.log("🔔 Получен callback от PayLink:", {
    status,
    uid,
    token,
    paymentId,
    amount,
  });

  if (status === "successful") {
    try {
      // Подключаемся к базе данных и находим заказ
      await connectDB();

      const order = await Order.findOne({ uid: uid });

      if (!order) {
        console.error(`❌ Заказ с UID ${uid} не найден в базе данных`);
        // Перенаправляем на страницу ошибки
        const failedUrl = new URL("/failed", request.url);
        failedUrl.searchParams.set("error", "order_not_found");
        failedUrl.searchParams.set("message", "Заказ не найден");
        return NextResponse.redirect(failedUrl);
      }

      // Обновляем статус заказа
      order.status = "successful";
      order.completedAt = new Date();
      order.paymentData = {
        paymentId: paymentId,
        amount: parseInt(amount) || order.totalPrice,
        currency: "KZT",
      };

      await order.save();

      console.log("✅ Статус заказа обновлен в БД:", {
        uid: order.uid,
        status: order.status,
        totalPrice: order.totalPrice,
      });

      // Отправляем email с подтверждением заказа, если еще не отправляли
      if (!order.emailSent && order.contactData?.email) {
        console.log(
          "📧 Отправка email подтверждения заказа на:",
          order.contactData.email
        );

        const emailSent = await sendOrderConfirmationEmail({
          customer: {
            name: "Покупатель", // Можно добавить поле name в contactData
            phone: order.contactData.phone,
            email: order.contactData.email,
          },
          order: {
            items: order.items.map((item) => ({
              name: item.title,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
            totalAmount: order.totalPrice,
          },
          orderId: order.uid,
        });

        if (emailSent) {
          // Отмечаем, что email отправлен
          order.emailSent = true;
          await order.save();
          console.log("✅ Email успешно отправлен и отмечен в БД");
        } else {
          console.log("❌ Ошибка при отправке email");
        }
      } else if (order.emailSent) {
        console.log("ℹ️ Email уже был отправлен ранее");
      } else {
        console.log("⚠️ Email не указан в заказе");
      }

      // Логируем успешную оплату
      console.log(
        `✅ Оплата успешна. UID: ${uid}, Сумма: ${order.totalPrice} ₸`
      );

      // Перенаправляем на страницу успеха с параметрами
      const successUrl = new URL("/success", request.url);
      successUrl.searchParams.set("orderId", uid);
      successUrl.searchParams.set("paymentId", paymentId || "");
      successUrl.searchParams.set("amount", amount || "");

      return NextResponse.redirect(successUrl);
    } catch (error) {
      console.error("❌ Ошибка при обработке успешной оплаты:", error);

      // В случае ошибки все равно перенаправляем на успех,
      // но логируем ошибку для дальнейшего анализа
      const successUrl = new URL("/success", request.url);
      successUrl.searchParams.set("orderId", uid);
      successUrl.searchParams.set("paymentId", paymentId || "");
      successUrl.searchParams.set("amount", amount || "");

      return NextResponse.redirect(successUrl);
    }
  }

  // При неуспешном статусе перенаправляем на страницу ошибки
  console.log(`❌ Неуспешная оплата. Статус: ${status}, UID: ${uid}`);

  const failedUrl = new URL("/failed", request.url);
  failedUrl.searchParams.set("error", status || "unknown");
  failedUrl.searchParams.set("orderId", uid || "");
  failedUrl.searchParams.set("amount", amount || "");

  return NextResponse.redirect(failedUrl);
}
