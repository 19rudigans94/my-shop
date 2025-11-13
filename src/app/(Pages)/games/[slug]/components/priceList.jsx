"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import useCartStore from "@/app/store/useCartStore";

export default function PriceList() {
  const params = useParams();
  const [prices, setPrices] = useState([]);
  const [digitalInfo, setDigitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Начинаем загрузку цен для slug:", params.slug);

        // Загрузка цен физических копий/
        const response = await fetch(`/api/games/${params.slug}/prices`);
        const data = await response.json();
        console.warn("Цены физических копий:", data);
        if (!response.ok || !data.success) {
          throw new Error(data?.error || "Ошибка загрузки цен");
        }
        setPrices(data.prices);

        // Автоматически выбираем первую платформу и вариант
        if (data.prices.length > 0) {
          setSelectedPlatform(data.prices[0].platform);
          if (data.prices[0].variants.length > 0) {
            setSelectedVariant(data.prices[0].variants[0]);
          }
        }

        console.log("Начинаем загрузку цифровых копий");

        // Загрузка информации о цифровых копиях
        const digitalResponse = await fetch(
          `/api/games/${params.slug}/digital`
        );
        console.log("Статус ответа цифровых копий:", digitalResponse.status);
        console.log(
          "Заголовки ответа цифровых копий:",
          digitalResponse.headers.get("content-type")
        );
        const rawText = await digitalResponse.clone().text();
        console.log("Сырое тело цифрового ответа (до парсинга):", rawText);
        console.log("Объект digitalResponse:", digitalResponse);

        let digitalData;
        try {
          digitalData = JSON.parse(rawText);
        } catch (jsonErr) {
          console.error("Ошибка при парсинге JSON цифровых копий:", jsonErr);
          throw new Error("Неверный формат JSON в ответе цифровых копий");
        }

        console.log("digitalData (после парсинга JSON):", digitalData);
        console.warn("Данные цифровых копий:", digitalData);

        if (Array.isArray(digitalData?.copies)) {
          setDigitalInfo({
            success: true,
            hasDigitalCopies: digitalData.copies.length > 0,
            platform:
              digitalData.copies.length > 0
                ? digitalData.copies[0].platform
                : "",
            price:
              digitalData.copies.length > 0 ? digitalData.copies[0].price : 0,
            totalCopies: digitalData.copies.length,
            copies: digitalData.copies.map((copy) => ({
              _id: copy._id,
              price: copy.price,
              platform: copy.platform,
              isActive: copy.isActive,
            })),
          });
        } else {
          throw new Error("Ошибка загрузки цифровых копий");
        }
      } catch (err) {
        console.error("Ошибка при загрузке цен:", err);
        setError(err?.message || "Произошла ошибка при загрузке цен");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [params.slug]);

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    const platformPrices = prices.find((p) => p.platform === platform);
    if (platformPrices?.variants.length > 0) {
      setSelectedVariant(platformPrices.variants[0]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const item = {
      _id: selectedVariant._id,
      title: params.slug,
      price: selectedVariant.price,
      platform: selectedPlatform,
      condition: selectedVariant.condition,
      type: "game",
      variant: "physical",
    };

    addToCart(item);
  };

  const handleAddDigitalToCart = (copy) => {
    const item = {
      _id: copy._id,
      title: params.slug,
      price: copy.price,
      platform: copy.platform,
      type: "game",
      variant: "digital",
    };

    addToCart(item);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }

  if (!prices.length && !digitalInfo?.hasDigitalCopies) {
    return <div className="text-gray-500">Цены не найдены</div>;
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded-lg w-1/3"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-lg w-full"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">Ошибка: {error}</p>
        </div>
      )}

      {!prices.length &&
        !digitalInfo?.hasDigitalCopies &&
        !loading &&
        !error && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">Цены не найдены</p>
          </div>
        )}

      {/* Выбор платформы */}
      {prices.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {prices.map((price) => (
              <button
                key={price.platform}
                onClick={() => handlePlatformChange(price.platform)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                  selectedPlatform === price.platform
                    ? "bg-amber-500 text-white font-medium shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300"
                }`}
              >
                {price.platform}
              </button>
            ))}
          </div>

          {/* Варианты для физических копий */}
          {selectedPlatform && (
            <div className="space-y-4">
              <div className="overflow-x-auto scrollbar-hide pb-2">
                <div className="flex gap-3">
                  {prices
                    .find((p) => p.platform === selectedPlatform)
                    ?.variants.map((variant) => (
                      <button
                        key={variant.condition}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 flex-shrink-0 rounded-xl border-2 transition-all duration-200 ${
                          selectedVariant === variant
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-300 dark:ring-amber-700"
                            : "border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800"
                        }`}
                      >
                        <div className="w-40 text-center">
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                              variant.condition === "new"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {variant.condition === "new" ? "Новый" : "Б/У"}
                          </div>
                          <div className="text-2xl font-bold mb-1">
                            {variant.price} ₸
                          </div>
                          <div
                            className={`text-xs ${
                              variant.stock > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {variant.stock > 0
                              ? `В наличии: ${variant.stock} шт.`
                              : "Нет в наличии"}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {selectedVariant && selectedVariant.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Добавить в корзину</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Цифровая версия */}
      {digitalInfo?.hasDigitalCopies && (
        <div className="mt-6 pt-6 border-t border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-block p-1.5 rounded-full bg-amber-100 dark:bg-amber-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-base font-medium text-amber-700 dark:text-amber-400">
                Цифровая версия ({digitalInfo.platform})
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Всего копий: {digitalInfo.totalCopies}
              </div>
            </div>
          </div>

          {/* Горизонтальный список цифровых копий */}
          {digitalInfo.copies && digitalInfo.copies.length > 0 && (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-2">
                {digitalInfo.copies.map((copy) => (
                  <div
                    key={copy._id}
                    className="border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 flex-shrink-0 w-52 bg-amber-50/50 dark:bg-amber-900/10 flex flex-col justify-between"
                  >
                    <div className="mb-3">
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="text-sm font-medium">Платформа:</div>
                        <div className="text-sm">{copy.platform}</div>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <div className="text-sm font-medium">Цена:</div>
                        <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                          {copy.price} ₸
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddDigitalToCart(copy)}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-2 px-4 rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Купить копию</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
