name: 🚀 Deploy to Production

on:
  push:
    branches:
      - main  # Деплой только при пуше в основную ветку

jobs:
  deploy:
    name: Deploy to Server
    runs-on: ubuntu-latest

    steps:
      # ==========================
      # 1️⃣ Клонирование репозитория
      # ==========================
      - name: Checkout repository
        uses: actions/checkout@v3

      # ==========================
      # 2️⃣ Установка Node.js и кеширование зависимостей
      # ==========================
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # ==========================
      # 3️⃣ Установка зависимостей
      # ==========================
      - name: Install dependencies
        run: npm ci

      # ==========================
      # 4️⃣ Проверка сборки (локально на GitHub Actions)
      # ==========================
      - name: Build test
        run: npm run build

      # ==========================
      # 5️⃣ Запуск SSH-агента
      # ==========================
      - name: Start SSH agent
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      # ==========================
      # 6️⃣ Деплой на сервер
      # ==========================
      - name: Deploy via SSH
        run: |
          ssh -o StrictHostKeyChecking=no ubuntu@82.115.49.188 "
            set -e;
            echo '📁 Переход в папку проекта...';
            cd ~/my-shop || { echo '❌ Папка my-shop не найдена'; exit 1; }

            echo '🔄 Обновление из Git...';
            git fetch origin main;
            git reset --hard origin/main;

            echo '📦 Установка зависимостей...';
            npm ci;

            echo '🛠 Сборка проекта...';
            npm run build;

            echo '🚀 Перезапуск сервиса через PM2...';
            pm2 restart my-shop;

            echo '✅ Деплой успешно завершён.';
          "

      # ==========================
      # 7️⃣ Уведомление об успешном деплое (опционально)
      # ==========================
      - name: Success message
        if: success()
        run: echo "🎉 Деплой успешно завершён!"