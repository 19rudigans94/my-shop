import CartItems from "./components/CartItems";
import CartSummary from "./components/CartSummary";
import { mockCartItems } from "./config/mockData";

export const metadata = {
  title: "Корзина | GoldGames",
  description: "Корзина с выбранными товарами",
};

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Корзина
      </h1>
      {mockCartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems items={mockCartItems} />
          </div>
          <div>
            <CartSummary items={mockCartItems} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-900 dark:text-white mb-4">
            Ваша корзина пуста
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Добавьте товары в корзину, чтобы оформить заказ
          </p>
          <a
            href="/games"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Перейти к играм
          </a>
        </div>
      )}
    </div>
  );
}
