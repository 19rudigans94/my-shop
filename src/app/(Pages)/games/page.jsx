"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Search from "@/app/components/Search";
import Filters from "@/app/components/Filters";
import MobileFilters from "@/app/components/Filters/MobileFilters";
import ActiveFilters from "@/app/components/Filters/ActiveFilters";
import { useFilters } from "@/app/hooks/useFilters";
import { gamesFilters } from "@/app/config/filters";
import GameCard from "@/app/components/GameCard";

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
  } = useFilters(gamesFilters);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();

        // Добавляем параметры фильтрации
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "all") {
            queryParams.append(key, value);
          }
        });

        const response = await fetch(`/api/games?${queryParams.toString()}`);
        if (!response.ok) throw new Error("Ошибка загрузки игр");

        const data = await response.json();
        setGames(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [filters]);

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
            config={gamesFilters}
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
            config={gamesFilters}
            className="mb-6"
          /> */}

          {/* Кнопка фильтров для мобильных */}
          {/* <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden mb-6 w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Фильтры
          </button> */}

          {/* Сетка игр */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                onClick={() => router.push(`/games/${game.slug}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Мобильные фильтры */}
      {/* <MobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        config={gamesFilters}
      /> */}
    </div>
  );
}
