"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ConsoleForm({ console, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    state: true,
    price: "",
    stock: "",
    image: "",
    youtubeUrl: "",
  });

  useEffect(() => {
    if (console) {
      setFormData({
        title: console.title || "",
        description: console.description || "",
        state: console.state ?? true,
        price: console.price || "",
        stock: console.stock || "",
        image: console.image || "",
        youtubeUrl: console.youtubeUrl || "",
      });
    }
  }, [console]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
            Состояние
          </label>
          <select
            value={formData.state ? "true" : "false"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                state: e.target.value === "true",
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="true">Новый</option>
            <option value="false">Б/у</option>
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
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Количество на складе
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, stock: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
            min="0"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL видео
          </label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
          {console ? "Сохранить изменения" : "Создать консоль"}
        </button>
      </div>
    </form>
  );
}
