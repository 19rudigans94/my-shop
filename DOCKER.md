# 🐳 Docker Setup Guide для my-shop

## Созданные файлы
- **Dockerfile** — многоэтапная сборка с dev и prod стадиями
- **docker-compose.yml** — оркестрация контейнеров (Next.js app + MongoDB)
- **.env.example** — пример конфигурации переменных окружения

## 🚀 Быстрый старт

### Dev режим (с hot-reload)

```bash
# Установите Docker Desktop если еще не установлен

# Запустите приложение в режиме разработки
docker-compose --profile dev up --build

# Приложение будет доступно на http://localhost:3000
# MongoDB на localhost:27017
# Любые изменения в коде будут автоматически перезагружены
```

### Production режим

```bash
# Запустите оптимизированную production сборку
docker-compose --profile prod up --build -d

# Приложение будет доступно на http://localhost:3000
# MongoDB на localhost:27017
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env.local` в корне проекта:

```bash
# MongoDB connection string для Docker
MONGODB_URI=mongodb://1admin:1password@mongo:27017/my-shop?authSource=admin

# Добавьте другие переменные из 1.env.local:
# PAYLINK_API_KEY=...
# SMTP_...=...
```

**Важно:** Не коммитьте `.env.local` в git, используйте `.gitignore`

## 📦 Структура Dockerfile

### Dev стадия
- Node.js 18 Alpine
- Все зависимости (dev + production)
- Монтирование исходного кода
- Hot-reload через Next.js dev server

### Production стадия (многоэтапная сборка)
1. **Builder** — собирает приложение
2. **Production** — содержит только необходимые файлы
   - `.next/standalone` — оптимизированное приложение
   - `.next/static` — статические файлы
   - `public/` — публичные файлы
   - Без dev зависимостей (меньше размер образа)

##  Безопасность

### MongoDB в Docker
- Включена аутентификация (admin / password)
- Volume для персистентности: `mongo_data`
- Изолирована в Docker network

### Рекомендации для Production
1. Измените пароль MongoDB:
   ```yaml
   # docker-compose.yml
   MONGO_INITDB_ROOT_PASSWORD: your-secure-password
   ```

2. Используйте `.env` для секретов:
   ```bash
   MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongo:27017/my-shop?authSource=admin
   ```

3. Используйте Docker secrets на Swarm/Kubernetes для production

## 📝 Полезные команды

```bash
# Просмотр логов приложения
docker-compose logs -f app-dev
docker-compose logs -f app-prod

# Просмотр логов MongoDB
docker-compose logs -f mongo

# Остановить контейнеры
docker-compose down

# Остановить и удалить volumes
docker-compose down -v

# Пересобрать образы без кеша
docker-compose --profile dev build --no-cache

# Выполнить команду в контейнере
docker-compose exec app-dev npm test

# Зайти в контейнер
docker-compose exec app-dev sh
docker-compose exec mongo mongosh -u admin -p password --authenticationDatabase admin
```

## 🐛 Решение проблем

### Порты занят
```bash
# Если порт 3000 или 27017 занят, измените в docker-compose.yml
# Например: "8000:3000" вместо "3000:3000"
```

### Ошибка подключения к MongoDB
```bash
# Убедитесь, что MongoDB контейнер запущен
docker-compose ps

# Проверьте логи MongoDB
docker-compose logs mongo

# Убедитесь, что MONGODB_URI правильный (mongo - имя сервиса)
```

### Hot-reload не работает в dev
```bash
# Убедитесь, что .env указывает на правильный сервис
# Перезапустите контейнер
docker-compose --profile dev restart app-dev
```

## 📚 Дополнительно

### Развертывание на сервер
Для production используйте:
- **Docker Swarm** — встроенная оркестрация
- **Kubernetes** — масштабируемое решение
- **AWS ECS / GCP Cloud Run** — облачные платформы

### Monitoring
Рекомендуется добавить:
- **Prometheus** — метрики приложения
- **Grafana** — визуализация метрик
- **ELK Stack** — логирование

### CI/CD
GitHub Actions можно настроить для:
- Сборки Docker образа
- Push в Docker Registry
- Автоматического деплоя на сервер

Пример добавления в `.github/workflows/docker.yml`