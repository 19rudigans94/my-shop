#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
NC='\033[0m' # Без цвета

echo -e "${GREEN}📁 Переход в папку проекта...${NC}"
cd ~/my-shop || { echo "❌ Папка my-shop не найдена"; exit 1; }

echo -e "${GREEN}🔄 Обновление из Git...${NC}"
git pull origin main || { echo "❌ Ошибка при git pull"; exit 1; }

echo -e "${GREEN}📦 Установка зависимостей...${NC}"
npm install || { echo "❌ Ошибка при установке зависимостей"; exit 1; }

echo -e "${GREEN}🛠 Сборка проекта...${NC}"
npm run build || { echo "❌ Ошибка сборки проекта"; exit 1; }

echo -e "${GREEN}🚀 Перезапуск сервиса через PM2...${NC}"
pm2 restart my-shop || { echo "❌ Ошибка при перезапуске PM2"; exit 1; }

echo -e "${GREEN}✅ Обновление завершено успешно.${NC}"