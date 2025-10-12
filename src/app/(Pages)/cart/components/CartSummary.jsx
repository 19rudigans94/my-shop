"use client";

import { useState } from "react";
import {
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  X,
  Phone,
  Mail,
} from "lucide-react";
import useCartStore from "@/app/store/useCartStore";
import { createPayLinkProduct } from "@/app/utils/paylink";

export default function CartSummary() {
  const [notification, setNotification] = useState(null);
  const [isPayLinkLoading, setIsPayLinkLoading] = useState(false);
  const [contactData, setContactData] = useState({
    phone: "",
    email: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    phone: "",
    email: "",
  });

  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Валидация телефона (казахстанский формат)
  const validatePhone = (phone) => {
    const phoneRegex =
      /^(\+7|8|7)?[\s\-]?\(?7\d{2}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
  };

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Проверка заполненности всех обязательных полей
  const isFormValid = () => {
    return (
      contactData.phone.trim() !== "" &&
      contactData.email.trim() !== "" &&
      validatePhone(contactData.phone) &&
      validateEmail(contactData.email)
    );
  };

  // Обработка изменения полей ввода
  const handleInputChange = (field, value) => {
    setContactData((prev) => ({ ...prev, [field]: value }));

    // Очистка ошибок при вводе
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Валидация полей при потере фокуса
  const handleInputBlur = (field) => {
    let error = "";

    if (field === "phone") {
      if (!contactData.phone.trim()) {
        error = "Номер телефона обязателен";
      } else if (!validatePhone(contactData.phone)) {
        error = "Неверный формат номера телефона";
      }
    } else if (field === "email") {
      if (!contactData.email.trim()) {
        error = "Email обязателен";
      } else if (!validateEmail(contactData.email)) {
        error = "Неверный формат email";
      }
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handlePayLinkCheckout = async () => {
    const totalPrice = getTotalPrice();
    const totalItems = getTotalItems();

    if (totalItems === 0) {
      showNotification("Корзина пуста", "error");
      return;
    }

    // Проверяем валидность формы перед отправкой
    if (!isFormValid()) {
      showNotification(
        "Пожалуйста, заполните все обязательные поля корректно",
        "error"
      );
      return;
    }

    const cartItems = useCartStore.getState().items;
    setIsPayLinkLoading(true);

    try {
      const cartData = {
        totalPrice,
        totalItems,
        items: cartItems,
        contactData: {
          phone: contactData.phone,
          email: contactData.email,
        },
      };

      const result = await createPayLinkProduct(cartData);

      if (result?.pay_url) {
        showNotification("Перенаправление на страницу оплаты...", "success");
        setTimeout(() => {
          window.location.href = result.pay_url;
        }, 1000);
      } else {
        throw new Error("Не удалось получить ссылку для оплаты");
      }
    } catch (error) {
      showNotification(
        error.message ||
          "Произошла ошибка при создании ссылки оплаты. Попробуйте еще раз.",
        "error"
      );
    } finally {
      setIsPayLinkLoading(false);
    }
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

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

        {/* Форма контактных данных */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Контактные данные
          </h3>

          {/* Поле телефона */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                placeholder="+7 (777) 123-45-67"
                value={contactData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                onBlur={() => handleInputBlur("phone")}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                  fieldErrors.phone
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Поле email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                placeholder="example@mail.com"
                value={contactData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => handleInputBlur("email")}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                  fieldErrors.email
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePayLinkCheckout}
            disabled={totalItems === 0 || isPayLinkLoading || !isFormValid()}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
              totalItems === 0 || isPayLinkLoading || !isFormValid()
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
              onClick={() => setNotification(null)}
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
