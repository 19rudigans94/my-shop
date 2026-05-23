"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFetchItem } from "@/shared/lib/hooks/use-fetch-item";
import ProductDetailsLayout from "@/shared/ui/product-details-layout";
import AddToCartButton from "@/features/cart/ui/add-to-cart-button";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ErrorDisplay from "@/shared/ui/error-display";

export default function ConsoleDetailsPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { item: consoleItem, loading, error } = useFetchItem(
    params.slug ? `/api/consoles/${params.slug}` : null,
    "console"
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  if (!consoleItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Консоль не найдена</div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Консоли", href: "/consoles" },
    { label: consoleItem.title },
  ];

  const specs = [
    {
      label: "Состояние",
      content: (
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
          {consoleItem.state ? "Новый" : "Б/у"}
        </span>
      ),
    },
    {
      label: "Наличие",
      content:
        consoleItem.stock > 0 ? (
          <span className="text-green-600 dark:text-green-400">
            В наличии ({consoleItem.stock} шт.)
          </span>
        ) : (
          <span className="text-red-600 dark:text-red-400">Нет в наличии</span>
        ),
    },
  ];

  const purchaseSection = (
    <div className="sticky top-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Цена</h2>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {consoleItem.price.toLocaleString()} ₸
        </div>
        {mounted && <AddToCartButton item={consoleItem} className="w-full mt-4" />}
      </div>
    </div>
  );

  return (
    <ProductDetailsLayout
      item={consoleItem}
      breadcrumbs={breadcrumbs}
      badges={[consoleItem.state ? "Новый" : "Б/у"]}
      specs={specs}
      videoTitle="Обзор"
      purchaseSection={purchaseSection}
    />
  );
}
