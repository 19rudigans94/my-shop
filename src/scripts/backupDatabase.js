import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Загрузка переменных окружения
dotenv.config({ path: path.resolve(__dirname, "../../.env.production") });

const uri = process.env.MONGODB_URI;
const backupDir = path.resolve(__dirname, "../../backups");

if (!uri) {
  console.error("Необходимо указать URI базы данных");
  process.exit(1);
}

// Создание директории для бэкапов, если она не существует
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // Создание бэкапа с помощью mongodump
    const { stdout, stderr } = await execAsync(
      `mongodump --uri="${uri}" --out="${backupPath}"`
    );

    if (stderr) {
      console.error("Ошибка при создании бэкапа:", stderr);
      return;
    }

    console.log("Бэкап успешно создан:", backupPath);

    // Архивирование бэкапа
    const archivePath = `${backupPath}.tar.gz`;
    await execAsync(
      `tar -czf "${archivePath}" -C "${backupDir}" "backup-${timestamp}"`
    );

    // Удаление исходной директории бэкапа
    await execAsync(`rm -rf "${backupPath}"`);

    console.log("Бэкап успешно заархивирован:", archivePath);

    // Удаление старых бэкапов (оставляем последние 5)
    const backups = fs
      .readdirSync(backupDir)
      .filter((file) => file.startsWith("backup-") && file.endsWith(".tar.gz"))
      .sort()
      .reverse();

    if (backups.length > 5) {
      for (const oldBackup of backups.slice(5)) {
        fs.unlinkSync(path.join(backupDir, oldBackup));
        console.log("Удален старый бэкап:", oldBackup);
      }
    }
  } catch (error) {
    console.error("Ошибка при создании бэкапа:", error);
  } finally {
    process.exit(0);
  }
}

backupDatabase();
