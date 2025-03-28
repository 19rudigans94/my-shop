import { mockPhysicalDisks } from "../data/mockPhysicalDisks.js";
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

// Импортируем схемы
const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platforms: { type: [String], required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  genre: { type: [String], required: true },
});

const physicalDiskSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  variants: [
    {
      condition: {
        type: String,
        enum: ["new", "used"],
        required: true,
      },
      stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});

// Создаем модели
const Game = mongoose.model("Game", gameSchema);
const PhysicalDisk = mongoose.model("PhysicalDisk", physicalDiskSchema);

async function seedPhysicalDisks() {
  try {
    console.log("🔄 Подключение к базе данных...");
    console.log(`📡 URI: ${process.env.NEXT_PUBLIC_MONGODB_URI}`);

    // Подключаемся к БД
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI);
    console.log("✅ Подключение к базе данных успешно установлено");

    console.log("\n🔄 Начинаем заполнение базы данных физическими дисками...");

    // Очищаем коллекцию перед заполнением
    await PhysicalDisk.deleteMany({});
    console.log("✨ Коллекция PhysicalDisk очищена");

    // Проверяем существование всех игр
    for (const disk of mockPhysicalDisks) {
      try {
        const game = await Game.findById(disk.gameId);
        if (!game) {
          console.error(`❌ Игра с ID ${disk.gameId} не найдена, пропускаем`);
          continue;
        }

        // Проверяем, поддерживает ли игра указанную платформу
        if (!game.platforms.includes(disk.platform)) {
          console.error(
            `❌ Игра ${game.title} не поддерживает платформу ${disk.platform}, пропускаем`
          );
          continue;
        }

        // Создаем запись о физическом диске
        const physicalDisk = new PhysicalDisk(disk);
        await physicalDisk.save();
        console.log(
          `✅ Добавлен физический диск для игры ${game.title} (${disk.platform})`
        );
      } catch (error) {
        console.error(
          `❌ Ошибка при добавлении диска для игры ${disk.gameId}:`,
          error
        );
        continue;
      }
    }

    console.log("\n🎉 База данных успешно заполнена физическими дисками!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при заполнении базы данных:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Запускаем скрипт
seedPhysicalDisks();
