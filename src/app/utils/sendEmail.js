import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
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
  debug: true,
});

// Функция для создания таблицы товаров
function createItemsTable(items, totalAmount) {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Товар</th>
          <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">Количество</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Цена</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${
              item.name || item.title || "Товар"
            }</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">${
              item.quantity
            }</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${item.price.toLocaleString()} ₸</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${(
              item.price * item.quantity
            ).toLocaleString()} ₸</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr style="background-color: #f8f9fa; font-weight: bold;">
          <td colspan="3" style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Итого:</td>
          <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${totalAmount.toLocaleString()} ₸</td>
        </tr>
      </tfoot>
    </table>
  `;
}

// Отправка письма покупателю с подтверждением успешной оплаты
export async function sendCustomerPaymentConfirmation(orderData) {
  const { customerInfo, items, totalAmount, orderId } = orderData;

  const itemsTable = createItemsTable(items, totalAmount);

  const mailOptions = {
    from: `GoldGames <${process.env.NEXT_FEEDBACK_MAIL}>`,
    to: customerInfo.email,
    subject: `✅ Оплата подтверждена - Заказ #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0; font-size: 28px;">✅ Оплата успешна!</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Заказ #${orderId}</p>
          </div>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="color: #155724; margin: 0; font-weight: bold;">
              🎉 Спасибо за покупку! Ваша оплата прошла успешно.
            </p>
          </div>
          
          <h3 style="color: #333; margin-bottom: 15px;">📦 Детали заказа:</h3>
          ${itemsTable}
          
          <h3 style="color: #333; margin: 30px 0 15px 0;">👤 Контактная информация:</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #666; margin: 5px 0;">
              <strong>Email:</strong> ${customerInfo.email}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Телефон:</strong> ${customerInfo.phoneNumber}
            </p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="color: #856404; margin: 0;">
              <strong>📧 Важно:</strong> Данные для доступа к цифровым товарам будут отправлены в течение 5-15 минут.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              При возникновении вопросов обращайтесь: <a href="mailto:info@goldgames.kz" style="color: #007bff;">info@goldgames.kz</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email покупателю отправлен успешно:", info.response);
    return true;
  } catch (error) {
    console.error("Ошибка при отправке email покупателю:", error);
    return false;
  }
}

// Отправка письма в магазин с информацией о новом заказе
export async function sendStoreOrderNotification(orderData) {
  const { customerInfo, items, totalAmount, orderId } = orderData;

  const itemsTable = createItemsTable(items, totalAmount);

  const mailOptions = {
    from: `GoldGames <${process.env.NEXT_FEEDBACK_MAIL}>`,
    to: "info@goldgames.kz",
    subject: `🛒 Новый заказ #${orderId} - ${totalAmount.toLocaleString()} ₸`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h1 style="color: #856404; margin: 0; font-size: 24px;">🛒 Новый заказ получен!</h1>
          <p style="color: #856404; margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">Заказ #${orderId}</p>
        </div>
        
        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
          <h3 style="color: #0c5460; margin: 0 0 10px 0;">💰 Сумма заказа: ${totalAmount.toLocaleString()} ₸</h3>
          <p style="color: #0c5460; margin: 0;">Требует обработки и отправки товаров покупателю.</p>
        </div>
        
        <h3 style="color: #333; margin-bottom: 15px;">📦 Состав заказа:</h3>
        ${itemsTable}
        
        <h3 style="color: #333; margin: 30px 0 15px 0;">👤 Данные покупателя:</h3>
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
          <div style="margin-bottom: 15px;">
            <strong style="color: #333;">📧 Email:</strong>
            <p style="color: #666; margin: 5px 0; font-size: 16px;">${
              customerInfo.email
            }</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #333;">📱 Телефон:</strong>
            <p style="color: #666; margin: 5px 0; font-size: 16px;">${
              customerInfo.phoneNumber
            }</p>
          </div>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 10px; margin-top: 15px;">
            <p style="color: #155724; margin: 0; font-size: 14px;">
              <strong>⚡ Действие требуется:</strong> Обработайте заказ и отправьте товары на указанный email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            Время заказа: ${new Date().toLocaleString("ru-RU", {
              timeZone: "Asia/Almaty",
            })}
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email в магазин отправлен успешно:", info.response);
    return true;
  } catch (error) {
    console.error("Ошибка при отправке email в магазин:", error);
    return false;
  }
}

// Устаревшая функция - оставляем для обратной совместимости
export async function sendOrderConfirmationEmail(orderData) {
  const { customer, order, orderId } = orderData;

  const itemsTable = createItemsTable(order.items, order.totalAmount);

  const mailOptions = {
    from: `GoldGames <${process.env.NEXT_FEEDBACK_MAIL}>`,
    to: customer.email,
    subject: `Подтверждение заказа #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Спасибо за ваш заказ!</h2>
        <p style="color: #666;">Здравствуйте, ${customer.name}!</p>
        <p style="color: #666;">Ваш заказ #${orderId} успешно оформлен.</p>
        
        <h3 style="color: #333; margin-top: 30px;">Детали заказа:</h3>
        ${itemsTable}
        
        <h3 style="color: #333; margin-top: 30px;">Контактная информация:</h3>
        <p style="color: #666;">
          <strong>Имя:</strong> ${customer.name}<br>
          <strong>Телефон:</strong> ${customer.phone}<br>
          <strong>Email:</strong> ${customer.email}
        </p>
        
        <p style="color: #666; margin-top: 30px; text-align: center;">
          Если у вас есть вопросы, пожалуйста, свяжитесь с нами.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email отправлен успешно:", info.response);
    return true;
  } catch (error) {
    console.error("Ошибка при отправке email:", error);
    return false;
  }
}
