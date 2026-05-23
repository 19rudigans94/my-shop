"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/shared/ui/toast";
import ImageUploader from "@/shared/ui/image-uploader";

export default function ConsoleForm({ console, onSubmit, onCancel }) {
  const { toast } = useToast();
  const uploaderRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: console?.title || "",
    description: console?.description || "",
    state: console?.state ?? true,
    price: console?.price || "",
    stock: console?.stock || "",
    images: console?.images || [],
    youtubeUrl: console?.youtubeUrl || "",
  });

  useEffect(() => {
    if (console) {
      setFormData({
        title: console.title || "",
        description: console.description || "",
        state: console.state ?? true,
        price: console.price || "",
        stock: console.stock || "",
        images: console.images || [],
        youtubeUrl: console.youtubeUrl || "",
      });
    }
  }, [console]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      const uploadedImages = await uploaderRef.current.uploadPending();

      if (uploadedImages.length === 0) {
        toast.error("Добавьте хотя бы одно изображение");
        return;
      }

      onSubmit({ ...formData, images: uploadedImages });
    } catch (err) {
      toast.error(err.message || "Ошибка при загрузке изображений");
    } finally {
      setUploading(false);
    }
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
            required
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL видео
          </label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Изображения
        </label>
        <ImageUploader
          ref={uploaderRef}
          images={formData.images}
          uploadType="consoles"
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
          disabled={uploading}
          className="px-4 py-2 bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-60"
        >
          {uploading ? "Загрузка..." : console ? "Сохранить изменения" : "Создать консоль"}
        </button>
      </div>
    </form>
  );
}
