import nodemailer from "nodemailer";

// Mail
// NEXT_SMTP_HOST=goldgames.kz
// NEXT_SMTP_PORT=465
// NEXT_SMTP_USER=support@goldgames.kz
// NEXT_SMTP_PASSWORD=Robert210814!
// NEXT_FEEDBACK_MAIL=support@goldgames.kz

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
