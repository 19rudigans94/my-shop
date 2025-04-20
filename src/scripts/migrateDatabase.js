import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Загрузка переменных окружения
dotenv.config({ path: path.resolve(__dirname, "../../.env.production") });

const sourceUri = process.env.MONGODB_URI;
const targetUri = process.env.PRODUCTION_MONGODB_URI;

if (!sourceUri || !targetUri) {
  console.error("Необходимо указать URI для исходной и целевой базы данных");
  process.exit(1);
}

async function migrateDatabase() {
  try {
    // Подключение к исходной базе данных
    const sourceConnection = await mongoose.createConnection(sourceUri);
    console.log("Подключено к исходной базе данных");

    // Подключение к целевой базе данных
    const targetConnection = await mongoose.createConnection(targetUri);
    console.log("Подключено к целевой базе данных");

    // Получение списка коллекций
    const collections = await sourceConnection.db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Миграция коллекции: ${collectionName}`);

      // Получение данных из исходной коллекции
      const documents = await sourceConnection.db
        .collection(collectionName)
        .find({})
        .toArray();

      if (documents.length > 0) {
        // Вставка данных в целевую коллекцию
        await targetConnection.db
          .collection(collectionName)
          .insertMany(documents);
        console.log(
          `Успешно мигрировано ${documents.length} документов в ${collectionName}`
        );
      }
    }

    console.log("Миграция завершена успешно");
  } catch (error) {
    console.error("Ошибка при миграции:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateDatabase();
