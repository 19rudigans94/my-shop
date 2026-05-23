"use client";

import React from "react";
import { X } from "lucide-react";

const ActiveFilters = ({
  filters,
  removeFilter,
  clearFilters,
  config,
  className = "",
}) => {
  const getActiveFilterLabels = () => {
    const activeLabels = [];

    config.forEach((filterGroup) => {
      const value = filters[filterGroup.id];
      if (value && value !== "all") {
        const option = filterGroup.options.find((opt) => opt.value === value);
        if (option) {
          activeLabels.push({
            group: filterGroup.id,
            value,
            label: option.label,
          });
        }
      }
    });

    return activeLabels;
  };

  const activeFilterLabels = getActiveFilterLabels();

  if (activeFilterLabels.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeFilterLabels.map(({ group, value, label }) => (
        <button
          key={`${group}-${value}`}
          onClick={() => removeFilter(group)}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
        >
          {label}
          <X className="ml-1.5 h-4 w-4" />
        </button>
      ))}
      {activeFilterLabels.length > 1 && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Сбросить все
          <X className="ml-1.5 h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
