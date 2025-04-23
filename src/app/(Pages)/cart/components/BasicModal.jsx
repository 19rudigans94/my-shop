"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, Check } from "lucide-react";

export default function BasicModal({ isOpen, closeModal, total, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Закрытие по нажатию Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeModal, isSubmitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Форматирование ввода
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .slice(0, 19);
    } else if (name === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "$1/$2")
        .slice(0, 5);
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    } else if (name === "phone") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/, "+$1 ($2) $3-$4-$5")
        .slice(0, 18);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Введите ваше имя";

    if (!formData.phone.trim()) {
      newErrors.phone = "Введите номер телефона";
    } else if (!/^\+\d\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      newErrors.phone = "Неверный формат номера";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите электронную почту";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Введите номер карты";
    } else if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Номер карты должен содержать 16 цифр";
    }

    if (!formData.cardHolder.trim())
      newErrors.cardHolder = "Введите имя владельца карты";

    if (!formData.expiry.trim()) {
      newErrors.expiry = "Введите срок действия";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = "Неверный формат (ММ/ГГ)";
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = "Введите CVV";
    } else if (formData.cvv.length !== 3) {
      newErrors.cvv = "CVV должен содержать 3 цифры";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Имитация отправки данных на сервер
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Успешное оформление заказа
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          closeModal();
        }

        // Сбросить состояние после закрытия
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({
            name: "",
            phone: "",
            email: "",
            cardNumber: "",
            cardHolder: "",
            expiry: "",
            cvv: "",
          });
        }, 300);
      }, 2000);
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
      setErrors({
        submit: "Произошла ошибка при оформлении заказа. Попробуйте позже.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик клика по оверлею
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-7 relative animate-fadeIn mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pt-1 pb-2 z-10">
          <h3 className="text-lg sm:text-xl font-medium leading-6 text-gray-900 dark:text-white">
            {isSuccess ? "Заказ оформлен!" : "Оформление заказа"}
          </h3>
          <button
            onClick={() => !isSubmitting && closeModal()}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-full p-1 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="mt-4 flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-scaleIn">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
              Спасибо за ваш заказ!
            </p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center max-w-xs mx-auto">
              Мы отправили подтверждение на вашу электронную почту.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  Контактная информация
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Имя
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                      placeholder="Ваше имя"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Телефон
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                      placeholder="+7 (___) ___-__-__"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                      placeholder="example@mail.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  <span>Платежная информация</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Номер карты
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                      placeholder="____ ____ ____ ____"
                      disabled={isSubmitting}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Имя владельца
                    </label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                      placeholder="IVAN IVANOV"
                      disabled={isSubmitting}
                    />
                    {errors.cardHolder && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.cardHolder}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Срок действия
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                        placeholder="ММ/ГГ"
                        disabled={isSubmitting}
                      />
                      {errors.expiry && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.expiry}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                        placeholder="•••"
                        disabled={isSubmitting}
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="mt-6">
              <div className="font-medium text-gray-900 dark:text-white mb-3 text-center sm:text-left">
                Итого к оплате:{" "}
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {total.toLocaleString()} ₸
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-amber-500 text-white rounded-lg flex items-center justify-center font-medium transition-all ${
                  isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-amber-600 active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Обработка...
                  </>
                ) : (
                  "Оплатить"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
