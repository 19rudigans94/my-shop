import { FeedbackForm } from "@/features/feedback/ui/feedback-form";
import { Phone, Mail, Clock } from "lucide-react";

export const metadata = {
  title: "Обратная связь | GoldGames",
  description: "Свяжитесь с нами — мы всегда рады помочь",
};

function ContactInfo() {
  return (
    <div className="border-l-4 border-yellow-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
        Как с нами связаться
      </h3>
      <div className="space-y-4">
        <a href="tel:+77477048081" className="flex items-center gap-3 group">
          <Phone size={18} className="text-yellow-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
            +7 747 704 8081
          </span>
        </a>
        <a href="mailto:admin@goldgames.kz" className="flex items-center gap-3 group">
          <Mail size={18} className="text-yellow-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
            admin@goldgames.kz
          </span>
        </a>
        <div className="flex items-start gap-3">
          <Clock size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-600 dark:text-gray-300">Пн–Пт: 10:00–19:00</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Обычно отвечаем в течение рабочего дня
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Обратная связь
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Есть вопрос? Напишите нам — ответим в течение рабочего дня.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3">
          <FeedbackForm />
        </div>
        <aside className="lg:col-span-2">
          <ContactInfo />
        </aside>
      </div>
    </div>
  );
}
