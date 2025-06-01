import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { message: "Метод не поддерживается" },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Валидация на сервере
    if (
      !name ||
      typeof name !== "string" ||
      name.length < 2 ||
      name.length > 50
    ) {
      return NextResponse.json(
        { message: "Некорректное имя" },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ) {
      return NextResponse.json(
        { message: "Некорректный email" },
        { status: 400 }
      );
    }

    if (
      !message ||
      typeof message !== "string" ||
      message.length < 10 ||
      message.length > 1000
    ) {
      return NextResponse.json(
        { message: "Сообщение должно быть от 10 до 1000 символов" },
        { status: 400 }
      );
    }

    // Проверяем наличие необходимых переменных окружения
    const requiredEnvVars = [
      "NEXT_SMTP_HOST",
      "NEXT_SMTP_PORT",
      "NEXT_SMTP_USER",
      "NEXT_SMTP_PASSWORD",
      "NEXT_FEEDBACK_MAIL",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Отсутствует переменная окружения: ${envVar}`);
        return NextResponse.json(
          { message: "Ошибка конфигурации сервера" },
          { status: 500 }
        );
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_SMTP_HOST,
      port: Number(process.env.NEXT_SMTP_PORT),
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.NEXT_SMTP_USER,
        pass: process.env.NEXT_SMTP_PASSWORD,
      },
    });

    const htmlContent = generateEmailTemplate({ name, email, message });

    const mailOptions = {
      from: process.env.NEXT_SMTP_USER, // Используем адрес SMTP сервера как отправителя
      replyTo: email, // Устанавливаем адрес для ответа
      to: process.env.NEXT_FEEDBACK_MAIL,
      subject: `Новое сообщение от ${name}`,
      text: `Имя: ${name}\nEmail: ${email}\nСообщение: ${message}`,
      html: htmlContent,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Ошибка отправки почты:", emailError);
      return NextResponse.json(
        { message: "Ошибка при отправке сообщения" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Сообщение успешно отправлено" },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Общая ошибка:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

function generateEmailTemplate({ name, email, message }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Новое сообщение от ${name}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; padding: 30px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FFD700; font-size: 24px; margin: 0; padding-bottom: 15px; border-bottom: 3px solid #FFD700;">
              Сообщение с формы обратной связи -- GoldGames
            </h1>
          </div>
          <div style="margin: 20px 0;">
            <p style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0;">
              <strong style="color: #FFD700;">Имя:</strong> 
              <span style="color: #333;">${name}</span>
            </p>
            <p style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0;">
              <strong style="color: #FFD700;">Email:</strong> 
              <span style="color: #333;">${email}</span>
            </p>
            <p style="color: #FFD700; font-weight: bold; margin-top: 20px;">Сообщение:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #FFD700;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
