# 🔧 Устранение проблем с PayLink

## Проблема: Бесконечная загрузка после ввода данных

### 🔍 Диагностика проблемы

**Симптомы:**

- После ввода данных карты на странице PayLink происходит бесконечная загрузка
- Пользователь не возвращается на сайт
- Нет callback от PayLink

**Основные причины:**

### 1. ❌ Отсутствует или неправильный RETURN_URL

**Проблема:** PayLink не знает, куда перенаправить пользователя после оплаты.

**Решение:**

```bash
# Проверить переменную окружения
echo $PAYLINK_RETURN_URL

# Добавить в .env.local для разработки
PAYLINK_RETURN_URL=http://localhost:3000/api/paylink/verification

# Для продакшена
PAYLINK_RETURN_URL=https://yourdomain.com/api/paylink/verification
```

### 2. 🌐 Недоступность callback endpoint

**Проблема:** PayLink не может отправить callback на ваш сервер.

**Проверка доступности:**

```bash
# Тест локального endpoint
curl -X GET "http://localhost:3000/api/paylink/test"

# Тест verification endpoint
curl -X GET "http://localhost:3000/api/paylink/verification?status=test&uid=123"
```

### 3. 🔒 Проблемы с SSL/HTTPS

**Для продакшена:**

- Убедитесь, что ваш домен имеет валидный SSL сертификат
- PayLink требует HTTPS для callback URL в продакшене

### 4. 🔑 Неправильные учетные данные

**Проверка:**

```bash
# Проверить наличие всех переменных
grep PAYLINK .env.local
```

Должны быть установлены:

- `PAYLINK_SHOP_ID` - ID вашего магазина
- `PAYLINK_SHOP_SECRET` - Секретный ключ
- `PAYLINK_RETURN_URL` - URL для возврата пользователя

## 🛠️ Пошаговое устранение

### Шаг 1: Проверить переменные окружения

```bash
# Проверить все PayLink переменные
grep PAYLINK .env.local

# Если отсутствуют, добавить:
echo 'PAYLINK_RETURN_URL=http://localhost:3000/api/paylink/verification' >> .env.local
```

### Шаг 2: Перезапустить сервер

```bash
# Остановить текущий процесс
pkill -f "next dev"

# Запустить заново
npm run dev
```

### Шаг 3: Протестировать endpoint

```bash
# Тест доступности
curl -X GET "http://localhost:3000/api/paylink/test"
```

### Шаг 4: Проверить логи

Следить за логами в консоли при создании PayLink:

```
🔗 Return URL: http://localhost:3000/api/paylink/verification
🏪 Shop ID: 29249...
🔑 Shop Secret: УСТАНОВЛЕН
```

### Шаг 5: Тестовая оплата

1. Добавить товар в корзину
2. Заполнить контактные данные
3. Нажать "Быстрая оплата"
4. Проверить логи на наличие callback

## 🔍 Отладка в реальном времени

### Логирование callback

В файле `verification/route.js` добавлено расширенное логирование:

```javascript
console.log("🌐 Полный URL callback:", request.url);
console.log(
  "📋 Все параметры URL:",
  Object.fromEntries(searchParams.entries())
);
```

### Тестовые данные карты PayLink

Для тестирования используйте тестовые данные карты от PayLink:

- Номер карты: `4400430000000000`
- Срок действия: любая будущая дата
- CVV: `123`

## 🚀 Для продакшена

### Обязательные настройки:

1. **HTTPS обязателен** - PayLink не работает с HTTP в продакшене
2. **Публичный домен** - localhost не работает для callback
3. **Правильный return_url**:
   ```
   PAYLINK_RETURN_URL=https://yourdomain.com/api/paylink/verification
   ```

### Проверка в продакшене:

```bash
# Тест доступности endpoint из интернета
curl -X GET "https://yourdomain.com/api/paylink/test"
```

## 📞 Поддержка PayLink

Если проблема не решается:

1. Проверить документацию PayLink: https://checkout.paylink.kz/
2. Связаться с технической поддержкой PayLink
3. Предоставить логи и конфигурацию (без секретных ключей)

## ✅ Чек-лист проверки

- [ ] Установлены все переменные окружения
- [ ] Return URL корректный и доступен
- [ ] Сервер перезапущен после изменения .env
- [ ] Endpoint /api/paylink/verification отвечает
- [ ] Логи показывают корректную конфигурацию
- [ ] Для продакшена: HTTPS настроен
- [ ] Тестовая оплата проходит успешно
