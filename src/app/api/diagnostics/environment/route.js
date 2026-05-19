import { NextResponse } from "next/server";

export async function GET() {
  try {
    const requiredEnvVars = {
      // PayLink переменные
      PAYLINK_SHOP_ID: process.env.PAYLINK_SHOP_ID,
      PAYLINK_SHOP_SECRET: process.env.PAYLINK_SHOP_SECRET,
      PAYLINK_RETURN_URL: process.env.PAYLINK_RETURN_URL,
      
      // Email переменные
      NEXT_SMTP_HOST: process.env.NEXT_SMTP_HOST,
      NEXT_SMTP_PORT: process.env.NEXT_SMTP_PORT,
      NEXT_SMTP_USER: process.env.NEXT_SMTP_USER,
      NEXT_SMTP_PASSWORD: process.env.NEXT_SMTP_PASSWORD,
      NEXT_FEEDBACK_MAIL: process.env.NEXT_FEEDBACK_MAIL,
      
      // База данных
      MONGODB_URI: process.env.MONGODB_URI,
    };

    const missingVars = [];
    const presentVars = [];
    const maskedVars = {};

    Object.entries(requiredEnvVars).forEach(([key, value]) => {
      if (!value) {
        missingVars.push(key);
      } else {
        presentVars.push(key);
        // Маскируем значения для безопасности
        if (key.includes('SECRET') || key.includes('PASSWORD')) {
          maskedVars[key] = '***' + value.slice(-4);
        } else if (key.includes('URI')) {
          maskedVars[key] = value.replace(/\/\/.*@/, '//***@');
        } else {
          maskedVars[key] = value.length > 20 ? value.slice(0, 10) + '...' + value.slice(-4) : value;
        }
      }
    });

    const success = missingVars.length === 0;

    return NextResponse.json({
      success,
      message: success 
        ? 'Все переменные окружения настроены' 
        : `Отсутствуют переменные: ${missingVars.join(', ')}`,
      details: {
        total: Object.keys(requiredEnvVars).length,
        present: presentVars.length,
        missing: missingVars.length,
        missingVars,
        presentVars,
        maskedValues: maskedVars,
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Ошибка при проверке переменных окружения:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при проверке переменных окружения',
        details: {
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}