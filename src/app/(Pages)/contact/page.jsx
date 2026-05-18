import Link from "next/link";
import {
  Calendar,
  Package,
  Users,
  ShieldCheck,
  Shield,
  Award,
  MessageCircle,
  Truck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "О нас | GoldGames",
  description:
    "GoldGames - ваш надежный партнер в мире игровых развлечений с 2015 года",
};

const stats = [
  { icon: Calendar, value: "С 2015 года", label: "На рынке" },
  { icon: Package, value: "500+ игр", label: "В каталоге" },
  { icon: Users, value: "1000+ клиентов", label: "Довольных покупателей" },
  { icon: ShieldCheck, value: "Гарантия 1 год", label: "На всю технику" },
];

const advantages = [
  { icon: Shield, text: "Только оригинальная продукция от официальных поставщиков" },
  { icon: Award, text: "Гарантия на всю технику от 1 года" },
  { icon: MessageCircle, text: "Профессиональная консультация при выборе" },
  { icon: Truck, text: "Быстрая доставка по всей Караганде" },
  { icon: CreditCard, text: "Удобные способы оплаты" },
];

const contacts = [
  { icon: Phone, label: "Телефон", value: "+7 747 704 8081", href: "tel:+77477048081" },
  { icon: Mail, label: "Email", value: "admin@goldgames.kz", href: "mailto:admin@goldgames.kz" },
  { icon: MapPin, label: "Адрес", value: "г. Караганда", href: null },
  { icon: Clock, label: "Режим работы", value: "Пн–Пт 10:00–19:00", href: null },
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Текст о компании */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          О нас
        </h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <p>
            GoldGames — ваш надёжный партнёр в мире игровых развлечений с 2015
            года. Мы специализируемся на продаже игр для PlayStation, приставок и
            аксессуаров.
          </p>
          <p>
            Наша команда состоит из опытных профессионалов, которые страстно любят
            игры и стремятся предоставить нашим клиентам лучший сервис. Мы всегда
            на связи, чтобы помочь вам с выбором и ответить на любые вопросы.
          </p>
          <p>
            Мы гордимся тем, что предлагаем широкий ассортимент товаров, включая
            редкие и эксклюзивные игры, а также популярные консоли и аксессуары.
            Наша цель — сделать покупки удобными и приятными для каждого клиента.
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={value}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex flex-col items-center text-center gap-2"
          >
            <Icon className="w-7 h-7 text-yellow-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Преимущества */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Наши преимущества
        </h3>
        <ul className="space-y-3">
          {advantages.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-300">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Контакты */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Контактная информация
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map(({ icon: Icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
            >
              <Icon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                {href ? (
                  <a
                    href={href}
                    className="text-gray-900 dark:text-white font-medium hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/games"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-500 hover:text-yellow-500 dark:hover:text-yellow-400 font-medium rounded-lg transition-colors"
        >
          Перейти в каталог
        </Link>
        <Link
          href="/contact/feedback"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-500 hover:text-yellow-500 dark:hover:text-yellow-400 font-medium rounded-lg transition-colors"
        >
          Написать нам
        </Link>
      </div>
    </div>
  );
}
