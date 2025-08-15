"use client";

import { useState } from "react";
import {
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  X,
  Mail,
  Phone,
} from "lucide-react";
import useCartStore from "@/app/store/useCartStore";
import { createPayLinkProduct } from "@/app/utils/paylink";

export default function CartSummary() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isPayLinkLoading, setIsPayLinkLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const clearCart = useCartStore((state) => state.clearCart);

  // Включение режима отладки (можно вынести в переменные окружения)
  const DEBUG_MODE = process.env.NODE_ENV === "development";

  const debugLog = (message, ...args) => {
    if (DEBUG_MODE) {
      console.log(message, ...args);
    }
  };

  // Функции валидации
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateContactFields = () => {
    let isValid = true;

    // Валидация email
    if (!email.trim()) {
      setEmailError("Email обязателен для заполнения");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Введите корректный email");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Валидация телефона
    if (!phoneNumber.trim()) {
      setPhoneError("Номер телефона обязателен для заполнения");
      isValid = false;
    } else if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("Введите корректный номер телефона");
      isValid = false;
    } else {
      setPhoneError("");
    }

    return isValid;
  };

  const handleCheckout = () => {
    setIsModalOpen(true);
  };

  const showNotification = (message, type = "error") => {
    console.log(`🔔 Показ уведомления [${type.toUpperCase()}]:`, message);
    setNotification({ message, type });
    setTimeout(() => {
      console.log("🔕 Автоматическое скрытие уведомления через 5 сек");
      setNotification(null);
    }, 5000);
  };

  const handlePayLinkCheckout = async () => {
    console.log("🛒 Начало процесса оплаты через PayLink");
    console.log("- Общая сумма:", totalPrice, "тенге");
    console.log("- Количество товаров:", totalItems);

    if (totalItems === 0) {
      console.warn("⚠️ Попытка оплаты пустой корзины");
      showNotification("Корзина пуста", "error");
      return;
    }

    // Валидация контактных данных
    if (!validateContactFields()) {
      console.warn("⚠️ Не заполнены обязательные поля");
      showNotification("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }

    const cartItems = useCartStore.getState().items;
    console.log("📦 Состав корзины:", cartItems);

    setIsPayLinkLoading(true);
    console.log("⏳ Установлен флаг загрузки PayLink");

    try {
      console.log("🚀 Вызов createPayLinkProduct...");
      const cartData = {
        totalPrice,
        totalItems,
        items: cartItems,
        customerInfo: {
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
        },
      };

      const result = await createPayLinkProduct(cartData);
      console.log("📊 Результат от createPayLinkProduct:", result);

      if (result?.pay_url) {
        console.log("✅ Получена ссылка для оплаты:", result.pay_url);
        showNotification("Перенаправление на страницу оплаты...", "success");

        console.log("⏰ Запуск таймера перенаправления (1000ms)...");
        setTimeout(() => {
          console.log("🔄 Выполнение перенаправления на:", result.pay_url);
          window.location.href = result.pay_url;
        }, 1000);
      } else {
        console.error("❌ PayLink не вернул ссылку для оплаты");
        console.error("- Полученный результат:", result);
        throw new Error("Не удалось получить ссылку для оплаты");
      }
    } catch (error) {
      console.error("💥 Ошибка в handlePayLinkCheckout:");
      console.error("- Название ошибки:", error.name);
      console.error("- Сообщение ошибки:", error.message);
      console.error("- Стек ошибки:", error.stack);

      showNotification(
        error.message ||
          "Произошла ошибка при создании ссылки оплаты. Попробуйте еще раз.",
        "error"
      );
    } finally {
      console.log("🏁 Снятие флага загрузки PayLink");
      setIsPayLinkLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOrderSuccess = () => {
    console.log("🎉 Успешное оформление заказа");
    console.log("- Очистка корзины...");
    // Очистка корзины при успешном оформлении заказа
    clearCart();
    console.log("- Закрытие модального окна...");
    closeModal();
    console.log("✅ Процесс оформления завершен");
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Логирование при каждом рендере компонента
  console.log("🔄 CartSummary рендер:");
  console.log("- Текущая цена:", totalPrice);
  console.log("- Текущее количество:", totalItems);
  console.log("- Состояние загрузки PayLink:", isPayLinkLoading);
  console.log("- Состояние модального окна:", isModalOpen);
  console.log("- Текущее уведомление:", notification);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Итого
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Товары ({totalItems})</span>
            <span>{totalPrice.toLocaleString()} ₸</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Доставка</span>
            <span>Бесплатно</span>
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
              <span>Итого к оплате</span>
              <span className="text-amber-600 dark:text-amber-400">
                {totalPrice.toLocaleString()} ₸
              </span>
            </div>
          </div>
        </div>

        {/* Поля контактной информации */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Контактная информация
          </h3>

          {/* Поле Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="example@email.com"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  emailError
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {emailError && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {emailError}
              </p>
            )}
          </div>

          {/* Поле номера телефона */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Номер телефона *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="+7 (777) 123-45-67"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  phoneError
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {phoneError && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {phoneError}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              console.log(
                "🖱️ Пользователь нажал кнопку 'Быстрая оплата (PayLink)'"
              );
              handlePayLinkCheckout();
            }}
            disabled={
              totalItems === 0 ||
              isPayLinkLoading ||
              !email.trim() ||
              !phoneNumber.trim()
            }
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
              totalItems === 0 ||
              isPayLinkLoading ||
              !email.trim() ||
              !phoneNumber.trim()
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            {isPayLinkLoading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Создание ссылки...
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Быстрая оплата (PayLink)
              </>
            )}
          </button>
        </div>

        {totalItems > 0 && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Нажимая кнопку «Оформить заказ», вы соглашаетесь с условиями
            публичной оферты
          </p>
        )}
      </div>

      {/* Компонент уведомлений */}
      {notification && (
        <div
          className="fixed top-4 right-4 max-w-sm w-full"
          style={{ zIndex: 999999 }}
        >
          <div
            className={`p-4 rounded-lg shadow-xl flex items-center space-x-3 backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-green-50/95 dark:bg-green-900/90 border border-green-200 dark:border-green-800"
                : "bg-red-50/95 dark:bg-red-900/90 border border-red-200 dark:border-red-800"
            }`}
            style={{ zIndex: 999999 }}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p
              className={`text-sm font-medium ${
                notification.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {notification.message}
            </p>
            <button
              onClick={() => {
                console.log("❌ Пользователь закрыл уведомление вручную");
                setNotification(null);
              }}
              className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                notification.type === "success"
                  ? "hover:bg-green-600"
                  : "hover:bg-red-600"
              }`}
              style={{ zIndex: 999999 }}
            >
              <X
                className={`w-4 h-4 ${
                  notification.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
