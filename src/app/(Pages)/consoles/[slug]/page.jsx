"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
// import { useCartStore } from "@/app/store/useCartStore";

export default function ConsoleDetailsPage() {
  const params = useParams();
  const [console, setConsole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchConsole = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!params.slug) {
          throw new Error("Не указан slug консоли");
        }

        const response = await fetch(`/api/consoles/${params.slug}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.error || "Ошибка загрузки консоли");
        }

        if (!data.console) {
          throw new Error("Консоль не найдена");
        }

        setConsole(data.console);
      } catch (err) {
        console.error("Ошибка при загрузке консоли:", err);
        setError(err?.message || "Произошла ошибка при загрузке консоли");
      } finally {
        setLoading(false);
      }
    };

    fetchConsole();
  }, [params.slug]);

  const handleAddToCart = () => {
    // if (console) {
    // addToCart({
    //     id: console._id,
    //     title: console.title,
    //     price: console.price,
    //     image: console.image,
    //     platform: console.platform,
    //     quantity: 1,
    //   });
    // }
    console.log(console);
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

  if (!console) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Консоль не найдена</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Изображение */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <Image
            src={console.image}
            alt={console.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Информация */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{console.title}</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {console.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{console.price} ₸</p>
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
                <p className="text-gray-500 dark:text-gray-400">Состояние</p>
                <p className="font-medium text-green-500">
                  {console.state ? "Новый" : "Б/у"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Дополнительное поле
                </p>
                <p className="font-medium">Не указано</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Артикул</p>
                <p className="font-medium">{console._id}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Дополнительное поле
                </p>
                <p className="font-medium text-green-500">Не указано</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
