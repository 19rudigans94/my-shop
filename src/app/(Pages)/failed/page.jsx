"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useCartStore from "@/app/store/useCartStore";

function FailedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getTotalPrice } = useCartStore();

  const [errorDetails, setErrorDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Получаем параметры из URL
  const errorCode = searchParams.get("error");
  const errorMessage = searchParams.get("message");
  const orderId = searchParams.get("orderId") || searchParams.get("uid");
  const amount = searchParams.get("amount");
  const paymentErrorCode = searchParams.get("code");

  useEffect(() => {
    // Определяем тип ошибки и соответствующее сообщение
    const getErrorInfo = (code) => {
      const errorTypes = {
        insufficient_funds: {
          title: "Недостаточно средств",
          description:
            "На вашей карте недостаточно средств для совершения покупки",
          icon: "💳",
          color: "red",
        },
        card_declined: {
          title: "Карта отклонена",
          description: "Ваш банк отклонил транзакцию. Попробуйте другую карту",
          icon: "🚫",
          color: "red",
        },
        expired_card: {
          title: "Карта просрочена",
          description: "Срок действия вашей карты истек",
          icon: "📅",
          color: "orange",
        },
        network_error: {
          title: "Ошибка сети",
          description: "Произошла ошибка соединения. Попробуйте еще раз",
          icon: "🌐",
          color: "blue",
        },
        timeout: {
          title: "Время ожидания истекло",
          description: "Операция заняла слишком много времени",
          icon: "⏰",
          color: "yellow",
        },
        cancelled: {
          title: "Платеж отменен",
          description: "Вы отменили операцию оплаты",
          icon: "❌",
          color: "gray",
        },
        payment_cancelled: {
          title: "Платеж не завершен",
          description: "Процесс оплаты был прерван или не завершен",
          icon: "⏹️",
          color: "orange",
        },
        invalid_card: {
          title: "Неверные данные карты",
          description: "Проверьте правильность введенных данных карты",
          icon: "💳",
          color: "red",
        },
        order_not_found: {
          title: "Заказ не найден",
          description: "Не удалось найти информацию о вашем заказе в системе",
          icon: "🔍",
          color: "orange",
        },
        invalid_request: {
          title: "Неверный запрос",
          description: "Получены некорректные данные о платеже",
          icon: "⚠️",
          color: "red",
        },
        update_failed: {
          title: "Ошибка обновления",
          description: "Не удалось обновить статус заказа в системе",
          icon: "🔄",
          color: "red",
        },
        system_error: {
          title: "Системная ошибка",
          description: "Произошла внутренняя ошибка системы",
          icon: "🛠️",
          color: "red",
        },
        default: {
          title: "Ошибка оплаты",
          description: "Произошла неизвестная ошибка при обработке платежа",
          icon: "⚠️",
          color: "red",
        },
      };

      return errorTypes[code] || errorTypes.default;
    };

    setErrorDetails({
      ...getErrorInfo(errorCode),
      customMessage: errorMessage,
      orderId: orderId,
      paymentErrorCode: paymentErrorCode,
      amount: amount || (items.length > 0 ? getTotalPrice() : 0),
      timestamp: new Date().toLocaleString("ru-RU"),
    });

    setIsLoading(false);
  }, [errorCode, errorMessage, orderId, amount, paymentErrorCode, items, getTotalPrice]);

  const handleRetryPayment = () => {
    // Возвращаем пользователя в корзину для повторной попытки оплаты
    router.push("/cart");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleContinueShopping = () => {
    router.push("/games");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Анализируем ошибку...
          </p>
        </div>
      </div>
    );
  }

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
        header: "from-red-500 to-red-600",
        text: "text-red-600 dark:text-red-400",
        button: "bg-red-500 hover:bg-red-600",
      },
      orange: {
        bg: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
        header: "from-orange-500 to-orange-600",
        text: "text-orange-600 dark:text-orange-400",
        button: "bg-orange-500 hover:bg-orange-600",
      },
      blue: {
        bg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
        header: "from-blue-500 to-blue-600",
        text: "text-blue-600 dark:text-blue-400",
        button: "bg-blue-500 hover:bg-blue-600",
      },
      yellow: {
        bg: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
        header: "from-yellow-500 to-yellow-600",
        text: "text-yellow-600 dark:text-yellow-400",
        button: "bg-yellow-500 hover:bg-yellow-600",
      },
      gray: {
        bg: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
        header: "from-gray-500 to-gray-600",
        text: "text-gray-600 dark:text-gray-400",
        button: "bg-gray-500 hover:bg-gray-600",
      },
    };
    return colors[color] || colors.red;
  };

  const colorClasses = getColorClasses(errorDetails.color);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colorClasses.bg} py-12`}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Основная карточка ошибки */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Заголовок с иконкой */}
          <div
            className={`bg-gradient-to-r ${colorClasses.header} px-8 py-12 text-center`}
          >
            <div className="text-6xl mb-6 animate-pulse">
              {errorDetails.icon}
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {errorDetails.title}
            </h1>
            <p className="text-xl text-white/90">{errorDetails.description}</p>
          </div>

          {/* Детали ошибки */}
          <div className="px-8 py-8">
            <div className="space-y-8">
              {/* Информация об ошибке */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Детали ошибки
                  </h3>
                  <div className="space-y-3 text-sm">
                    {errorDetails.orderId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Номер заказа:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {errorDetails.orderId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Время ошибки:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {errorDetails.timestamp}
                      </span>
                    </div>
                    {errorDetails.paymentErrorCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Код ошибки:
                        </span>
                        <span className="font-mono text-red-600 dark:text-red-400">
                          {errorDetails.paymentErrorCode}
                        </span>
                      </div>
                    )}
                    {errorDetails.customMessage && (
                      <div className="mt-4">
                        <span className="text-gray-600 dark:text-gray-300 block mb-2">
                          Сообщение:
                        </span>
                        <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 p-2 rounded text-xs font-mono">
                          {errorDetails.customMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {errorDetails.amount > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Сумма к оплате
                    </h3>
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {Number(errorDetails.amount).toLocaleString("ru-RU")} ₸
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Товары остались в корзине
                    </p>
                  </div>
                )}
              </div>

              {/* Возможные решения */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Что можно сделать?
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  {errorCode === "payment_cancelled" ? (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <p>Попробуйте оплатить заказ еще раз</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <p>
                          Убедитесь, что у вас стабильное интернет-соединение
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <p>Не закрывайте окно браузера до завершения оплаты</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </div>
                        <p>
                          Если проблема повторяется, попробуйте другую карту
                        </p>
                      </div>
                    </>
                  ) : errorCode === "order_not_found" ? (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <p>Создайте новый заказ с теми же товарами</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <p>Проверьте, что товары еще есть в наличии</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <p>
                          Обратитесь в поддержку с номером заказа, если он у вас
                          есть
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </div>
                        <p>
                          Возможно, заказ был создан, но данные не сохранились -
                          свяжитесь с нами
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <p>Проверьте данные вашей карты и попробуйте еще раз</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <p>
                          Попробуйте использовать другую карту или способ оплаты
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <p>
                          Обратитесь в ваш банк для уточнения причины отклонения
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </div>
                        <p>
                          Свяжитесь с нашей поддержкой, если проблема
                          повторяется
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRetryPayment}
                  className={`flex-1 ${colorClasses.button} text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  Попробовать еще раз
                </button>
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
                <p className="mb-4 font-semibold">
                  Нужна помощь? Мы всегда готовы помочь!
                </p>
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
                    <span>WhatsApp поддержка</span>
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
                    <span>Email поддержка</span>
                  </a>
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Время работы поддержки: ПН-ВС с 9:00 до 21:00 (GMT+6)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Загрузка страницы ошибки...
            </p>
          </div>
        </div>
      }
    >
      <FailedPageContent />
    </Suspense>
  );
}
