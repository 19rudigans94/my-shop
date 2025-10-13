"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useCartStore from "@/app/store/useCartStore";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart, getTotalPrice } = useCartStore();

  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Получаем параметры из URL
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    // Анимация конфетти при загрузке страницы
    setShowConfetti(true);

    // Сохраняем детали заказа перед очисткой корзины
    if (items.length > 0) {
      setOrderDetails({
        items: [...items],
        totalAmount: getTotalPrice(),
        orderDate: new Date().toLocaleString("ru-RU"),
        orderId: orderId || `ORDER-${Date.now()}`,
        paymentId: paymentId || `PAY-${Date.now()}`,
      });
    }

    // Очищаем корзину после успешной оплаты
    const timer = setTimeout(() => {
      clearCart();
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [items, clearCart, getTotalPrice, orderId, paymentId]);

  const handleContinueShopping = () => {
    router.push("/games");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Обрабатываем ваш заказ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-12">
      {/* Конфетти анимация */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-70"></div>
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Основная карточка успеха */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Заголовок с иконкой */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 animate-bounce">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Оплата прошла успешно!
            </h1>
            <p className="text-xl text-green-100">
              Спасибо за покупку в GoldGames
            </p>
          </div>

          {/* Детали заказа */}
          <div className="px-8 py-8">
            {orderDetails && (
              <div className="space-y-8">
                {/* Информация о заказе */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Информация о заказе
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Номер заказа:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {orderDetails.orderId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Дата заказа:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {orderDetails.orderDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          ID платежа:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {orderDetails.paymentId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Сумма к оплате
                    </h3>
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {orderDetails.totalAmount.toLocaleString("ru-RU")} ₸
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Товаров: {orderDetails.items.length}
                    </p>
                  </div>
                </div>

                {/* Список купленных товаров */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Купленные товары
                  </h3>
                  <div className="space-y-4">
                    {orderDetails.items.map((item, index) => (
                      <div
                        key={`${item.id}-${item.condition}-${item.variant}`}
                        className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-slide-in-right"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <p>Платформа: {item.platform}</p>
                            <p>
                              Состояние:{" "}
                              {item.condition === "new" ? "Новый" : "Б/У"}
                            </p>
                            <p>
                              Тип:{" "}
                              {item.variant === "physical"
                                ? "Физический"
                                : "Цифровой"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {(item.price * item.quantity).toLocaleString(
                              "ru-RU"
                            )}{" "}
                            ₸
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {item.quantity} шт. ×{" "}
                            {item.price.toLocaleString("ru-RU")} ₸
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Что дальше */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Что дальше?
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <p>
                        Мы обработаем ваш заказ в течение 15-30 минут в рабочее
                        время
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <p>
                        Для цифровых товаров вы получите коды/аккаунты на
                        указанный email
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <p>
                        Физические товары будут доставлены по указанному адресу
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={handleContinueShopping}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Продолжить покупки
              </button>
              <button
                onClick={handleGoHome}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200"
              >
                На главную
              </button>
            </div>

            {/* Контактная информация */}
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2">Если у вас есть вопросы, свяжитесь с нами:</p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <a
                  href="https://wa.me/77477048081"
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:info@goldgames.kz"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
