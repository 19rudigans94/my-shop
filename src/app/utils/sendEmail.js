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

export async function sendOrderConfirmationEmail(orderData) {
  const { customer, order, orderId } = orderData;

  // Формируем HTML таблицу с товарами
  const itemsTable = `
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
        ${order.items
          .map(
            (item) => `
          <tr>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${
              item.name || "Товар"
            }</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">${
              item.quantity
            }</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${item.price.toLocaleString()} ₸</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${item.total.toLocaleString()} ₸</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr style="background-color: #f8f9fa; font-weight: bold;">
          <td colspan="3" style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Итого:</td>
          <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${order.totalAmount.toLocaleString()} ₸</td>
        </tr>
      </tfoot>
    </table>
  `;

  const mailOptions = {
    from: `GoldGames <${process.env.NEXT_FEEDBACK_MAIL}>`,
    to: customer.email,
    subject: `✅ Подтверждение заказа #${orderId} - GoldGames`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Подтверждение заказа</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Заголовок -->
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎮 GoldGames</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ваш заказ успешно оплачен!</p>
          </div>
          
          <!-- Основной контент -->
          <div style="padding: 40px 30px;">
            
            <!-- Приветствие -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
              <h2 style="color: #333; margin: 0; font-size: 24px;">Спасибо за покупку!</h2>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">
                Заказ <strong>#${orderId}</strong> успешно оплачен и принят в обработку
              </p>
            </div>
            
            <!-- Информация о заказе -->
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📋 Детали заказа</h3>
              ${itemsTable}
            </div>
            
            <!-- Контактная информация -->
            <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📞 Контактная информация</h3>
              <div style="color: #666; line-height: 1.6;">
                <p style="margin: 5px 0;"><strong>Телефон:</strong> ${customer.phone}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${customer.email}</p>
              </div>
            </div>
            
            <!-- Что дальше -->
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">🚀 Что дальше?</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Мы обработаем ваш заказ в течение 1-2 часов</li>
                <li>Цифровые товары будут отправлены на указанный email</li>
                <li>Физические товары будут доставлены по указанному адресу</li>
                <li>Вы получите уведомление о статусе заказа</li>
              </ul>
            </div>
            
            <!-- Поддержка -->
            <div style="text-align: center; padding: 20px; background-color: #fafafa; border-radius: 8px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">💬 Нужна помощь?</h3>
              <p style="color: #666; margin: 0 0 15px 0;">Мы всегда готовы помочь вам!</p>
              <div style="margin: 15px 0;">
                <a href="https://wa.me/77477048081" style="display: inline-block; background-color: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 0 5px; font-weight: bold;">
                  📱 WhatsApp
                </a>
                <a href="mailto:info@goldgames.kz" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 0 5px; font-weight: bold;">
                  ✉️ Email
                </a>
              </div>
              <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">
                Время работы: ПН-ВС с 9:00 до 21:00 (GMT+6)
              </p>
            </div>
            
          </div>
          
          <!-- Подвал -->
          <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 GoldGames. Все права защищены.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7;">
              Это автоматическое письмо, пожалуйста, не отвечайте на него.
            </p>
          </div>
          
        </div>
      </body>
      </html>
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
