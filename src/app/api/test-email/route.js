import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    console.log("🧪 Тестирование email настроек...");

    // Проверяем переменные окружения
    const requiredEnvVars = [
      "NEXT_SMTP_HOST",
      "NEXT_SMTP_PORT",
      "NEXT_SMTP_USER",
      "NEXT_SMTP_PASSWORD",
      "NEXT_FEEDBACK_MAIL",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Отсутствуют переменные окружения: ${missingVars.join(", ")}`,
        missingVars,
      });
    }

    console.log("✅ Все переменные окружения установлены");

    // Создаем транспортер
    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_SMTP_HOST,
      port: parseInt(process.env.NEXT_SMTP_PORT),
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

    // Тестируем соединение
    console.log("🔗 Проверка соединения с SMTP сервером...");
    await transporter.verify();
    console.log("✅ SMTP соединение успешно");

    // Отправляем тестовое письмо
    console.log("📧 Отправка тестового письма...");
    const testEmail = {
      from: `GoldGames Test <${process.env.NEXT_FEEDBACK_MAIL}>`,
      to: process.env.NEXT_SMTP_USER,
      subject: "🧪 Тест email системы GoldGames",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🧪 Тестовое письмо</h2>
          <p>Это тестовое письмо для проверки работы email системы GoldGames.</p>
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h4 style="color: #155724; margin: 0;">✅ Email система работает!</h4>
            <p style="color: #155724; margin: 10px 0 0 0;">
              Время отправки: ${new Date().toLocaleString("ru-RU")}<br>
              Сервер: ${process.env.NEXT_SMTP_HOST}:${
        process.env.NEXT_SMTP_PORT
      }<br>
              От: ${process.env.NEXT_FEEDBACK_MAIL}<br>
              Кому: ${process.env.NEXT_SMTP_USER}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(testEmail);

    console.log("✅ Тестовое письмо отправлено:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return NextResponse.json({
      success: true,
      message: "Email система работает корректно",
      details: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        smtpConfig: {
          host: process.env.NEXT_SMTP_HOST,
          port: process.env.NEXT_SMTP_PORT,
          from: process.env.NEXT_FEEDBACK_MAIL,
          to: process.env.NEXT_SMTP_USER,
        },
      },
    });
  } catch (error) {
    console.error("❌ Ошибка тестирования email:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          command: error.command,
          response: error.response,
        },
      },
      { status: 500 }
    );
  }
}
