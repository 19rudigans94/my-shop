"use client";

import { useState, useEffect } from "react";
const PLATFORMS = ["PS5", "PS4"];

export default function AccessoryForm({ accessory, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "",
    price: "",
    stock: "0",
    image: "",
  });

  useEffect(() => {
    if (accessory) {
      setFormData({
        title: accessory.title || "",
        description: accessory.description || "",
        platform: accessory.platform || "",
        price: accessory.price?.toString() || "",
        stock: accessory.stock?.toString() || "0",
        image: accessory.image || "",
      });
    }
  }, [accessory]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Преобразуем строковые значения в числа и валидируем
    const validatedData = {
      ...formData,
      price: Number(formData.price),
      stock: Math.max(0, Math.floor(Number(formData.stock))), // Округляем вниз и не допускаем отрицательные значения
    };

    onSubmit(validatedData);
  };

  const handleNumberChange = (e, field) => {
    const value = e.target.value;
    // Разрешаем только положительные числа
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFeatureAdd = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? value : feature
      ),
    }));
  };

  const handleFeatureRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Название
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Платформа
          </label>
          <select
            value={formData.platform}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, platform: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Выберите платформу</option>
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Цена
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Количество на складе
          </label>
          <input
            type="text"
            value={formData.stock}
            onChange={(e) => handleNumberChange(e, "stock")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
            min="0"
            pattern="\d*"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL изображения
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, image: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          {accessory ? "Сохранить изменения" : "Создать аксессуар"}
        </button>
      </div>
    </form>
  );
}
