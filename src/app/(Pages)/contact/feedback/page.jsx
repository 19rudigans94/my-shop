import { FeedbackForm } from "@/features/feedback-form";
import { Phone, Mail, Clock } from "lucide-react";

export const metadata = {
  title: "Обратная связь | GoldGames",
  description: "Свяжитесь с нами - мы всегда рады помочь",
};

export default function FeedbackPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Обратная связь
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Задайте вопрос — мы ответим в течение 24 часов.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Форма */}
        <div className="flex-1">
          <FeedbackForm />
        </div>

        {/* Боковая панель с контактами */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Связаться напрямую
            </h3>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Телефон</p>
                <a
                  href="tel:+77477048081"
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                >
                  +7 747 704 8081
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                <a
                  href="mailto:admin@goldgames.kz"
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors break-all"
                >
                  admin@goldgames.kz
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Время ответа</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  В течение 24 часов
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Пн–Пт 10:00–19:00</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
