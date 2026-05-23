export const metadata = {
  title: "О нас | GoldGames",
  description:
    "GoldGames - ваш надежный партнер в мире игровых развлечений с 2015 года",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        О нас
      </h2>

      <div className="space-y-6 text-gray-600 dark:text-gray-300">
        <p>
          GoldGames - ваш надежный партнер в мире игровых развлечений с 2015
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
          Наша цель - сделать покупки удобными и приятными для каждого клиента.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Наши преимущества:
          </h3>
          <ul className="list-none space-y-3">
            {advantages.map((advantage, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm mr-3 mt-0.5">
                  ✓
                </span>
                <span>{advantage}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const advantages = [
  "Только оригинальная продукция от официальных поставщиков",
  "Гарантия на всю технику от 1 года",
  "Профессиональная консультация при выборе",
  "Быстрая доставка по всей Караганде",
  "Удобные способы оплаты",
];
