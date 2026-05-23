"use client";

import { useState, useCallback } from "react";

export const useFilters = (initialConfig = {}) => {
  // Инициализируем начальное состояние фильтров из конфига
  const [filters, setFilters] = useState(() => {
    const initialFilters = {};
    Object.keys(initialConfig).forEach((key) => {
      initialFilters[key] = "all";
    });
    return initialFilters;
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Установка значения фильтра
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Удаление фильтра
  const removeFilter = useCallback((key) => {
    setFilters((prev) => {
      const { [key]: removed, ...rest } = prev;
      return {
        ...rest,
        [key]: "all",
      };
    });
  }, []);

  // Очистка всех фильтров
  const clearFilters = useCallback(() => {
    const resetFilters = {};
    Object.keys(initialConfig).forEach((key) => {
      resetFilters[key] = "all";
    });
    setFilters(resetFilters);
  }, [initialConfig]);

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
  };
};

export default useFilters;
