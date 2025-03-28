import { mockGames } from "../data/mockGames.js";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения
dotenv.config({ path: join(__dirname, "../../.env") });

// Проверяем наличие необходимых переменных окружения
if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
  console.error("❌ Ошибка: Не указан NEXT_PUBLIC_MONGODB_URI в файле .env");
  process.exit(1);
}

// Импортируем схему
const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platforms: { type: [String], required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  genre: { type: [String], required: true },
  youtubeUrl: { type: String, required: true },
});

// Создаем модель
const Game = mongoose.model("Game", gameSchema);

async function seedGames() {
  try {
    console.log("🔄 Подключение к базе данных...");
    console.log(`📡 URI: ${process.env.NEXT_PUBLIC_MONGODB_URI}`);

    // Подключаемся к БД
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI);
    console.log("✅ Подключение к базе данных успешно установлено");

    console.log("\n🔄 Начинаем заполнение базы данных играми...");

    // Очищаем коллекцию перед заполнением
    await Game.deleteMany({});
    console.log("✨ Коллекция Game очищена");

    // Добавляем youtubeUrl к каждой игре перед сохранением
    const gamesWithYoutube = mockGames.map((game) => ({
      ...game,
      youtubeUrl: `https://www.youtube.com/watch?v=${game.slug}`, // Временный URL для демонстрации
    }));

    // Добавляем игры
    const games = await Game.insertMany(gamesWithYoutube);
    console.log(`✅ Добавлено ${games.length} игр:`);

    // Выводим ID добавленных игр
    games.forEach((game) => {
      console.log(`📝 ${game.title}: ${game._id}`);
    });

    console.log("\n🎉 База данных успешно заполнена играми!");
    console.log("\n⚠️ Используйте эти ID для обновления mockPhysicalDisks.js");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при заполнении базы данных:", error);
    if (error.code === 11000) {
      console.error("Ошибка дублирования уникального поля (slug)");
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Запускаем скрипт
seedGames();
