import connectDB from "@/lib/mongodb";

/**
 * Проверка подключения к базе данных
 */
export async function ensureDbConnection() {
  const connection = await connectDB();
  if (!connection) {
    throw new Error("Ошибка подключения к базе данных");
  }
  return connection;
}
