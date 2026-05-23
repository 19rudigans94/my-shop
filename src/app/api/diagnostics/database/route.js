import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db/mongodb";
import Game from "@/entities/game/model/schema";
import Order from "@/entities/order/model/schema";

export async function GET() {
  try {
    console.log("🔍 Начинаем диагностику базы данных...");
    
    // Проверяем подключение к базе данных
    const connection = await connectDB();
    
    if (!connection) {
      throw new Error("Не удалось подключиться к базе данных");
    }

    console.log("✅ Подключение к базе данных установлено");

    // Проверяем состояние подключения
    const dbState = connection.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Проверяем доступность коллекций
    const collections = {};
    
    try {
      const gamesCount = await Game.countDocuments();
      collections.games = { count: gamesCount, status: 'ok' };
      console.log(`📊 Игр в базе: ${gamesCount}`);
    } catch (error) {
      collections.games = { status: 'error', error: error.message };
      console.error("❌ Ошибка при проверке коллекции games:", error.message);
    }

    try {
      const ordersCount = await Order.countDocuments();
      collections.orders = { count: ordersCount, status: 'ok' };
      console.log(`📊 Заказов в базе: ${ordersCount}`);
    } catch (error) {
      collections.orders = { status: 'error', error: error.message };
      console.error("❌ Ошибка при проверке коллекции orders:", error.message);
    }

    // Проверяем последние заказы
    let recentOrders = [];
    try {
      recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderId status paymentStatus totalAmount createdAt')
        .lean();
      console.log(`📋 Найдено последних заказов: ${recentOrders.length}`);
    } catch (error) {
      console.error("❌ Ошибка при получении последних заказов:", error.message);
    }

    const success = dbState === 1 && Object.values(collections).every(col => col.status === 'ok');

    return NextResponse.json({
      success,
      message: success 
        ? 'База данных работает корректно' 
        : 'Обнаружены проблемы с базой данных',
      details: {
        connectionState: dbStates[dbState] || 'unknown',
        dbName: connection.connection.db?.databaseName,
        host: connection.connection.host,
        port: connection.connection.port,
        collections,
        recentOrders: recentOrders.map(order => ({
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          amount: order.totalAmount,
          date: order.createdAt
        })),
        stats: {
          totalGames: collections.games?.count || 0,
          totalOrders: collections.orders?.count || 0,
        }
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('💥 Критическая ошибка при диагностике базы данных:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка подключения к базе данных',
        details: {
          message: error.message,
          name: error.name,
          mongoUri: process.env.MONGODB_URI ? 'установлен' : 'не установлен',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}