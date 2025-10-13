import { NextResponse } from "next/server";
import { getTimePlus30Minutes } from "../../utils/lifeTime";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    const { cartData } = await request.json();
    console.log("📦 Данные корзины:", JSON.stringify(cartData, null, 2));

    // Логируем контактные данные, если они есть
    if (cartData.contactData) {
      console.log("📞 Контактные данные:", {
        phone: cartData.contactData.phone,
        email: cartData.contactData.email,
      });
    }

    const expired_at = getTimePlus30Minutes();

    // Базовые переменные окружения
    const shopSecret = process.env.PAYLINK_SHOP_SECRET;
    const shopId = process.env.PAYLINK_SHOP_ID;
    let returnUrl = process.env.PAYLINK_RETURN_URL;

    // Если PAYLINK_RETURN_URL не установлен, формируем автоматически
    if (!returnUrl) {
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      const host = request.headers.get("host") || "goldgames.kz";
      returnUrl = `${protocol}://${host}/api/paylink/verification`;
      console.log(
        "⚠️ PAYLINK_RETURN_URL не установлен, используем автоматический:",
        returnUrl
      );
    }

    console.log("🔗 Return URL:", returnUrl);

    // Проверяем обязательные переменные
    if (!shopId || !shopSecret) {
      console.error("❌ Отсутствуют переменные окружения PayLink");
      return NextResponse.json(
        { success: false, error: "Не настроены переменные окружения PayLink" },
        { status: 500 }
      );
    }

    // Формируем название и описание заказа
    const orderName =
      cartData.items?.[0]?.title || "Покупка в интернет-магазине";
    const orderDescription =
      cartData.items
        ?.map((item) => `${item.title} (${item.quantity}шт)`)
        .join(", ") || "Заказ из интернет-магазина";

    // Данные для PayLink API согласно документации
    const payload = {
      name: orderName,
      description: orderDescription,
      currency: "KZT",
      amount: Math.round(cartData.totalPrice * 100),
      infinite: true,
      test: false,
      immortal: false,
      expired_at: expired_at, // обязательно если не immortal
      language: "ru", // двухбуквенный формат
      return_url: returnUrl,
    };

    console.log("📤 Payload для PayLink:", JSON.stringify(payload, null, 2));

    // Отправляем запрос к PayLink API
    const authString = `${shopId}:${shopSecret}`;
    const base64Auth = Buffer.from(authString).toString("base64");

    const response = await fetch("https://api.paylink.kz/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${base64Auth}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка PayLink API:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText };
      }

      return NextResponse.json(
        { success: false, error: error },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Сохраняем данные заказа в базу данных для последующего использования при успешной оплате
    if (result && result.uid) {
      try {
        await connectDB();

        const orderData = {
          uid: result.uid,
          items: cartData.items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            category: item.category,
            image: item.image,
            platform: item.platform,
            // Определяем тип товара на основе категории или других признаков
            type:
              item.category === "games" && item.platform
                ? "digital"
                : "physical",
          })),
          totalPrice: cartData.totalPrice,
          totalItems: cartData.totalItems,
          contactData: cartData.contactData,
          status: "pending",
        };

        const order = new Order(orderData);
        await order.save();

        console.log("💾 Заказ успешно сохранен в БД:", {
          uid: result.uid,
          totalPrice: cartData.totalPrice,
          email: cartData.contactData?.email,
        });
      } catch (dbError) {
        console.error("❌ Ошибка при сохранении заказа в БД:", dbError);
        // Продолжаем выполнение, даже если не удалось сохранить в БД
        // Но логируем ошибку для мониторинга
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
