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

  console.log("📧 Отправка email клиенту:", {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email клиенту отправлен успешно:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return true;
  } catch (error) {
    console.error("❌ Ошибка при отправке email клиенту:", {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    return false;
  }
}

export async function sendManagerNotificationEmail(orderData) {
  const { customer, order, orderId } = orderData;

  // Формируем HTML таблицу с товарами для менеджера
  const itemsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Товар</th>
          <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">Количество</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Цена</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Сумма</th>
          <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">Тип</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item) => `
          <tr>
            <td style="padding: 12px; border: 1px solid #dee2e6;">
              <strong>${item.name || "Товар"}</strong>
              ${
                item.platform
                  ? `<br><small style="color: #666;">Платформа: ${item.platform}</small>`
                  : ""
              }
            </td>
            <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">${
              item.quantity
            }</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${item.price.toLocaleString()} ₸</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${item.total.toLocaleString()} ₸</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">
              ${
                item.digitalKeys
                  ? `<span style="color: #28a745; font-weight: bold;">🔑 Цифровой</span><br><small>Ключи выданы</small>`
                  : `<span style="color: #dc3545; font-weight: bold;">📦 Физический</span><br><small>Требует доставки</small>`
              }
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr style="background-color: #f8f9fa; font-weight: bold;">
          <td colspan="4" style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Итого:</td>
          <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${order.totalAmount.toLocaleString()} ₸</td>
        </tr>
      </tfoot>
    </table>
  `;

  // Определяем приоритет заказа
  let priority = "🟢 Обычный";
  let actionRequired = "";

  if (order.hasDigitalItems && order.hasPhysicalItems) {
    priority = "🟡 Смешанный";
    actionRequired = "Требуется связаться с клиентом по физическим товарам";
  } else if (order.hasPhysicalItems) {
    priority = "🔴 Высокий";
    actionRequired = "Требуется связаться с клиентом для организации доставки";
  } else if (order.hasDigitalItems) {
    priority = "🟢 Низкий";
    actionRequired = "Цифровые ключи выданы автоматически";
  }

  const mailOptions = {
    from: `GoldGames <${process.env.NEXT_FEEDBACK_MAIL}>`,
    to: process.env.NEXT_SMTP_USER, // info@goldgames.kz
    subject: `🛒 Новый заказ #${orderId} - ${priority}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">🛒 Новый заказ!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Заказ #${orderId}</p>
        </div>

        <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #007bff; margin: 0 0 10px 0;">📋 Информация о заказе</h3>
          <p style="margin: 5px 0;"><strong>Дата заказа:</strong> ${
            order.orderDate || new Date().toLocaleString("ru-RU")
          }</p>
          <p style="margin: 5px 0;"><strong>ID платежа:</strong> ${
            order.paymentId || orderId
          }</p>
          <p style="margin: 5px 0;"><strong>Приоритет:</strong> ${priority}</p>
          <p style="margin: 5px 0;"><strong>Действие:</strong> ${actionRequired}</p>
        </div>

        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">👤 Данные клиента</h3>
          <p style="margin: 5px 0;"><strong>Имя:</strong> ${customer.name}</p>
          <p style="margin: 5px 0;"><strong>Телефон:</strong> <a href="tel:${
            customer.phone
          }" style="color: #856404;">${customer.phone}</a></p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${
            customer.email
          }" style="color: #856404;">${customer.email}</a></p>
          <p style="margin: 5px 0;"><strong>WhatsApp:</strong> <a href="https://wa.me/${customer.phone.replace(
            /[^0-9]/g,
            ""
          )}" style="color: #856404;">Написать в WhatsApp</a></p>
        </div>

        <h3 style="color: #333; margin-top: 30px;">🛍️ Детали заказа:</h3>
        ${itemsTable}

        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #155724; margin: 0 0 10px 0;">✅ Следующие шаги</h3>
          ${
            order.hasPhysicalItems
              ? `
            <p style="color: #155724; margin: 5px 0;">1. Связаться с клиентом по телефону или WhatsApp</p>
            <p style="color: #155724; margin: 5px 0;">2. Уточнить адрес и время доставки</p>
            <p style="color: #155724; margin: 5px 0;">3. Организовать доставку товара</p>
          `
              : `
            <p style="color: #155724; margin: 5px 0;">Все цифровые ключи отправлены клиенту автоматически.</p>
            <p style="color: #155724; margin: 5px 0;">Дополнительных действий не требуется.</p>
          `
          }
        </div>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <p style="margin: 0; color: #666;">
            Это автоматическое уведомление от системы GoldGames<br>
            Время получения: ${new Date().toLocaleString("ru-RU")}
          </p>
        </div>
      </div>
    `,
  };

  console.log("📧 Отправка email менеджеру:", {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email менеджеру отправлен успешно:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return true;
  } catch (error) {
    console.error("❌ Ошибка при отправке email менеджеру:", {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    return false;
  }
}
