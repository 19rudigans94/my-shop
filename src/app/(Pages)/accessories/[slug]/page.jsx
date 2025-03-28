"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
// import { useCartStore } from "@/app/store/useCartStore";

export default function AccessoryDetailsPage() {
  const params = useParams();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //   const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchAccessory = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Загрузка аксессуара:", params.slug);
        const response = await fetch(`/api/accessories/${params.slug}`);
        const data = await response.json();

        console.log("Получены данные:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Ошибка загрузки аксессуара");
        }

        setAccessory(data.accessory);
      } catch (err) {
        console.error("Ошибка при загрузке аксессуара:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchAccessory();
    }
  }, [params.slug]);

  const handleAddToCart = () => {
    // if (accessory) {
    //   addToCart({
    //     id: accessory._id,
    //     title: accessory.title,
    //     price: accessory.price,
    //     image: accessory.image,
    //     platform: accessory.platform,
    //     quantity: 1,
    //   });
    // }
    console.log(accessory);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  if (!accessory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Аксессуар не найден</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Изображение */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <Image
            src={accessory.image}
            alt={accessory.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Информация */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{accessory.title}</h1>
            <span
              className={`px-3 py-1 text-white text-sm rounded ${
                accessory.platform === "PS5"
                  ? "bg-yellow-500"
                  : accessory.platform === "Xbox"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {accessory.platform}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {accessory.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{accessory.price} ₸</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Цена включает НДС
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />В корзину
            </button>
          </div>

          {/* Дополнительная информация */}
          <div className="border-t dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Характеристики</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Платформа</p>
                <p className="font-medium">{accessory.platform}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Категория</p>
                <p className="font-medium">
                  {accessory.category || "Не указана"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Артикул</p>
                <p className="font-medium">{accessory._id}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Наличие</p>
                <p className="font-medium text-green-500">В наличии</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
