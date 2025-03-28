export const metadata = {
  title: "Пользовательское соглашение | GoldGames",
  description: "Пользовательское соглашение магазина GoldGames",
};

export default function AgreementPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Пользовательское соглашение
      </h2>

      <div className="prose prose-yellow dark:prose-invert max-w-none">
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">1. Общие положения</h3>
          <p>
            1.1. Настоящее Пользовательское соглашение регулирует отношения
            между GoldGames (далее — «Магазин») и пользователем сети Интернет
            (далее — «Покупатель»), возникающие при использовании
            интернет-ресурса goldgames.kz.
          </p>
          <p>
            1.2. Использование ресурса Магазина означает безоговорочное согласие
            Покупателя с настоящим Соглашением.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">2. Предмет соглашения</h3>
          <p>
            2.1. Магазин предоставляет Покупателю возможность приобретать игры,
            игровые консоли и аксессуары, представленные на сайте.
          </p>
          <p>
            2.2. Все товары, представленные на сайте, являются оригинальными и
            поставляются официальными дистрибьюторами.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            3. Права и обязанности сторон
          </h3>
          <h4 className="text-lg font-medium mb-3">3.1. Магазин обязуется:</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>Обеспечивать работу сайта 24/7</li>
            <li>Предоставлять актуальную информацию о товарах</li>
            <li>Обеспечивать сохранность персональных данных</li>
            <li>Выполнять заказы в согласованные сроки</li>
          </ul>

          <h4 className="text-lg font-medium mb-3">
            3.2. Покупатель обязуется:
          </h4>
          <ul className="list-disc pl-6 mb-4">
            <li>Предоставлять достоверную информацию при оформлении заказа</li>
            <li>Оплачивать заказанные товары в установленные сроки</li>
            <li>Соблюдать правила пользования сайтом</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">4. Конфиденциальность</h3>
          <p>
            4.1. Магазин гарантирует конфиденциальность персональных данных
            Покупателя и их защиту от несанкционированного использования.
          </p>
          <p>
            4.2. Покупатель соглашается на обработку персональных данных в целях
            выполнения заказа и информирования о новых товарах и акциях.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            5. Заключительные положения
          </h3>
          <p>
            5.1. Магазин оставляет за собой право вносить изменения в настоящее
            Соглашение без предварительного уведомления Покупателя.
          </p>
          <p>
            5.2. Все споры и разногласия решаются путем переговоров. В случае
            невозможности достижения согласия, споры решаются в судебном
            порядке.
          </p>
        </section>

        <div className="bg-yellow-50 dark:bg-gray-700/50 p-6 rounded-lg mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Последнее обновление: 22 марта 2024 года
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            По всем вопросам, связанным с данным соглашением, пожалуйста,
            обращайтесь в службу поддержки через форму обратной связи.
          </p>
        </div>
      </div>
    </div>
  );
}
