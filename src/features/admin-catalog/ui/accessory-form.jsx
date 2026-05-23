"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/shared/ui/toast";
import ImageUploader from "@/shared/ui/image-uploader";

const PLATFORMS = ["PS5", "Xbox Series X|S", "Nintendo Switch", "PC"];

export default function AccessoryForm({ accessory, onSubmit, onCancel }) {
  const { toast } = useToast();
  const uploaderRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: accessory?.title || "",
    description: accessory?.description || "",
    platform: accessory?.platform || "",
    price: accessory?.price?.toString() || "",
    stock: accessory?.stock?.toString() || "0",
    images: accessory?.images || [],
  });

  useEffect(() => {
    if (accessory) {
      setFormData({
        title: accessory.title || "",
        description: accessory.description || "",
        platform: accessory.platform || "",
        price: accessory.price?.toString() || "",
        stock: accessory.stock?.toString() || "0",
        images: accessory.images || [],
      });
    }
  }, [accessory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      const uploadedImages = await uploaderRef.current.uploadPending();

      if (uploadedImages.length === 0) {
        toast.error("Добавьте хотя бы одно изображение");
        return;
      }

      onSubmit({
        ...formData,
        images: uploadedImages,
        price: Number(formData.price),
        stock: Math.max(0, Math.floor(Number(formData.stock))),
      });
    } catch (err) {
      toast.error(err.message || "Ошибка при загрузке изображений");
    } finally {
      setUploading(false);
    }
  };

  const handleNumberChange = (e, field) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
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
            Платформа
          </label>
          <select
            value={formData.platform}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, platform: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
            required
            min="0"
            pattern="\d*"
            inputMode="numeric"
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
          uploadType="accessories"
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
          {uploading ? "Загрузка..." : accessory ? "Сохранить изменения" : "Создать аксессуар"}
        </button>
      </div>
    </form>
  );
}
