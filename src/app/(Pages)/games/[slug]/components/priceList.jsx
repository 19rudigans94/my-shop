"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
// import { useCartStore } from "@/app/store/useCartStore";

export default function PriceList() {
  const params = useParams();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  // const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/games/${params.slug}/prices`);
        const data = await response.json();

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
    // if (selectedPlatform && selectedVariant) {
    //   addToCart({
    //     id: params.slug,
    //     platform: selectedPlatform,
    //     condition: selectedVariant.condition,
    //     price: selectedVariant.price,
    //     quantity: 1,
    //   });
    // }
    console.log("addToCard");
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

  if (!prices.length) {
    return <div className="text-gray-500">Цены не найдены</div>;
  }

  return (
    <div className="space-y-6">
      {/* Выбор платформы */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Платформа
        </label>
        <div className="flex gap-2">
          {prices.map((price) => (
            <button
              key={price.platform}
              onClick={() => handlePlatformChange(price.platform)}
              className={`px-4 py-2 rounded-lg border ${
                selectedPlatform === price.platform
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {price.platform}
            </button>
          ))}
        </div>
      </div>

      {/* Варианты состояния и цены */}
      {selectedPlatform && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {prices
              .find((p) => p.platform === selectedPlatform)
              ?.variants.map((variant) => (
                <button
                  key={variant.condition}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-4 rounded-lg border ${
                    selectedVariant === variant
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div className="text-lg font-semibold">
                    {variant.condition === "new" ? "Новый" : "Б/У"}
                  </div>
                  <div className="text-2xl font-bold">{variant.price} ₸</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {variant.stock > 0
                      ? `В наличии: ${variant.stock}`
                      : "Нет в наличии"}
                  </div>
                </button>
              ))}
          </div>

          {/* Кнопка добавления в корзину */}
          {selectedVariant && selectedVariant.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Добавить в корзину</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
