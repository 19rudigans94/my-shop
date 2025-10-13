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
            <td style="padding: 12px; border: 1px solid #dee2e6;">
              ${item.name || "Товар"}
              ${
                item.platform
                  ? `<br><small style="color: #666;">${item.platform}</small>`
                  : ""
              }
              ${
                item.digitalKeys
                  ? `<br><span style="color: #28a745; font-weight: bold;">🔑 Цифровая копия</span>`
                  : ""
              }
            </td>
            <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">${
              item.quantity
            }</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${item.price.toLocaleString()} ₸</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${item.total.toLocaleString()} ₸</td>
          </tr>
          ${
            item.digitalKeys
              ? `
          <tr>
            <td colspan="4" style="padding: 12px; border: 1px solid #dee2e6; background-color: #f8f9fa;">
              <strong>🔑 Ключи активации:</strong><br>
              ${item.digitalKeys
                .map(
                  (key) =>
                    `<code style="background: #e9ecef; padding: 2px 4px; margin: 2px; display: inline-block; font-family: monospace;">${key}</code>`
                )
                .join("<br>")}
            </td>
          </tr>
          `
              : ""
          }
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

  // Формируем дополнительную информацию в зависимости от типа товаров
  let additionalInfo = "";

  if (order.hasDigitalItems && order.hasPhysicalItems) {
    additionalInfo = `
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h4 style="color: #856404; margin: 0 0 10px 0;">📦 Смешанный заказ</h4>
        <p style="color: #856404; margin: 0;">
          Ваш заказ содержит как цифровые, так и физические товары. Цифровые ключи указаны выше. 
          По физическим товарам с вами свяжется наш менеджер для уточнения деталей доставки.
        </p>
      </div>
    `;
  } else if (order.hasDigitalItems) {
    additionalInfo = `
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h4 style="color: #155724; margin: 0 0 10px 0;">🔑 Цифровые товары</h4>
        <p style="color: #155724; margin: 0;">
          Все ваши цифровые ключи указаны в таблице выше. Сохраните это письмо - оно содержит ваши ключи активации.
        </p>
      </div>
    `;
  } else if (order.hasPhysicalItems) {
    additionalInfo = `
      <div style="background-color: #cce7ff; border: 1px solid #99d6ff; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h4 style="color: #004085; margin: 0 0 10px 0;">📦 Физические товары</h4>
        <p style="color: #004085; margin: 0;">
          Наш менеджер свяжется с вами в ближайшее время для уточнения деталей доставки и передачи товара.
        </p>
      </div>
    `;
  }

  const mailOptions = {
    from: `GoldGames <${process.env.NEXT_FEEDBACK_MAIL}>`,
    to: customer.email,
    subject: `Подтверждение заказа #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Спасибо за ваш заказ!</h2>
        <p style="color: #666;">Здравствуйте, ${customer.name}!</p>
        <p style="color: #666;">Ваш заказ #${orderId} успешно оплачен ${
      order.orderDate ? `(${order.orderDate})` : ""
    }.</p>
        
        <h3 style="color: #333; margin-top: 30px;">Детали заказа:</h3>
        ${itemsTable}
        
        ${additionalInfo}
        
        <h3 style="color: #333; margin-top: 30px;">Контактная информация:</h3>
        <p style="color: #666;">
          <strong>Имя:</strong> ${customer.name}<br>
          <strong>Телефон:</strong> ${customer.phone}<br>
          <strong>Email:</strong> ${customer.email}
          ${
            order.paymentId
              ? `<br><strong>ID платежа:</strong> ${order.paymentId}`
              : ""
          }
        </p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
          <h4 style="color: #155724; margin: 0 0 10px 0;">📞 Поддержка</h4>
          <p style="color: #155724; margin: 0;">
            WhatsApp: <a href="https://wa.me/77477048081" style="color: #155724;">+7 747 704 80 81</a><br>
            Email: <a href="mailto:info@goldgames.kz" style="color: #155724;">info@goldgames.kz</a><br>
            Время работы: ПН-ВС с 9:00 до 21:00 (GMT+6)
          </p>
        </div>
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
