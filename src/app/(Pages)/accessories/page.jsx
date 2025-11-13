"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccessoryCard from "@/app/components/AccessoryCard";

export default function AccessoriesPage() {
  const router = useRouter();
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();

        // Добавляем параметры пагинации
        queryParams.append("page", pagination.page);
        queryParams.append("limit", pagination.limit);

        // console.log(
        //   "Отправка запроса:",
        //   `/api/accessories?${queryParams.toString()}`
        // );

        const response = await fetch(
          `/api/accessories?${queryParams.toString()}`
        );
        const data = await response.json();

        // console.log("Получены данные:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Ошибка загрузки аксессуаров");
        }

        setAccessories(data.accessories || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (err) {
        // console.error("Ошибка при загрузке аксессуаров:", err);
        setError(err.message);
        setAccessories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessories();
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Фильтры для десктопа */}
        <div className="hidden lg:block">
          {/* <Filters
            filters={filters}
            setFilter={setFilter}
            clearFilters={clearFilters}
            config={accessoriesFilters}
          /> */}
        </div>

        {/* Основной контент */}
        <div className="lg:col-span-3">
          {/* Поиск */}
          {/* <Search className="mb-6" /> */}

          {/* Активные фильтры */}
          {/* <ActiveFilters
            filters={filters}
            removeFilter={removeFilter}
            clearFilters={clearFilters}
            config={accessoriesFilters}
            className="mb-6"
          /> */}

          {/* Кнопка фильтров для мобильных */}
          {/* <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden mb-6 w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Фильтры
          </button> */}

          {/* Сетка аксессуаров */}
          {accessories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {accessories.map((accessory) => (
                <AccessoryCard
                  key={accessory._id}
                  accessory={accessory}
                  onClick={() => router.push(`/accessories/${accessory.slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Аксессуары не найдены
            </div>
          )}

          {/* Пагинация */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-md ${
                    pagination.page === page
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Мобильные фильтры */}
      {/* <MobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        config={accessoriesFilters}
      /> */}
    </div>
  );
}
