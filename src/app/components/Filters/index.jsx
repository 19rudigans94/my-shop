"use client";

import React from "react";
import { X } from "lucide-react";

const Filters = ({ filters, setFilter, clearFilters, config }) => {
  return (
    <div className="space-y-4">
      {config.map((filterGroup) => (
        <div
          key={filterGroup.id}
          className="border-b border-gray-200 dark:border-gray-700 pb-4"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            {filterGroup.name}
          </h3>
          <div className="space-y-2">
            {filterGroup.options.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={filterGroup.id}
                  checked={filters[filterGroup.id] === option.value}
                  onChange={() => setFilter(filterGroup.id, option.value)}
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name={filterGroup.id}
                checked={filters[filterGroup.id] === "all"}
                onChange={() => setFilter(filterGroup.id, "all")}
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Все</span>
            </label>
          </div>
        </div>
      ))}
      <button
        onClick={clearFilters}
        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <X className="h-4 w-4 mr-1" />
        Сбросить все фильтры
      </button>
    </div>
  );
};

export default Filters;
