import { Phone, Mail, Clock, CheckCircle } from "lucide-react";

export const metadata = {
  title: "О нас | GoldGames",
  description: "GoldGames — ваш надёжный партнёр в мире игровых развлечений с 2015 года",
};

const advantages = [
  "Только оригинальная продукция от официальных поставщиков",
  "Гарантия на всю технику от 1 года",
  "Профессиональная консультация при выборе",
  "Быстрая доставка по всей Караганде",
  "Удобные способы оплаты",
];

export default function ContactPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        О нас
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        GoldGames — ваш надёжный партнёр в мире игровых развлечений с 2015 года.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Мы специализируемся на продаже игр для PlayStation, приставок и аксессуаров.
            Наша команда состоит из опытных профессионалов, которые страстно любят игры
            и стремятся предоставить нашим клиентам лучший сервис. Мы всегда на связи,
            чтобы помочь вам с выбором и ответить на любые вопросы.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Мы гордимся широким ассортиментом товаров, включая редкие и эксклюзивные
            игры, а также популярные консоли и аксессуары. Наша цель — сделать покупки
            удобными и приятными для каждого клиента.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mt-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Наши преимущества
            </h3>
            <ul className="space-y-3">
              {advantages.map((advantage) => (
                <li key={advantage} className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="flex-shrink-0 text-yellow-500 mt-0.5"
                  />
                  <span className="text-gray-600 dark:text-gray-300">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside>
          <div className="border-l-4 border-yellow-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Как с нами связаться
            </h3>
            <div className="space-y-4">
              <a
                href="tel:+77477048081"
                className="flex items-center gap-3 group"
              >
                <Phone size={18} className="text-yellow-500 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  +7 747 704 8081
                </span>
              </a>
              <a
                href="mailto:admin@goldgames.kz"
                className="flex items-center gap-3 group"
              >
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
                    Сб–Вс: выходной
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
