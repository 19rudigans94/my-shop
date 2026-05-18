"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageUploader({ category, images = [], onChange }) {
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file) => {
    try {
      setError("");
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", file.name || "");

      const response = await fetch(`/api/upload?category=${category}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка при загрузке изображения");
      }

      onChange([...images, data.image]);
    } catch (uploadError) {
      setError(uploadError.message || "Не удалось загрузить изображение");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadImage(file);
    event.target.value = "";
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  const handleAltChange = (index, value) => {
    onChange(
      images.map((image, idx) =>
        idx === index ? { ...image, alt: value } : image
      )
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Изображения товара
      </label>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          {isUploading ? "Загрузка..." : "Выбрать файл"}
        </label>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={`${image.url}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="relative h-32 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
              <Image
                src={image.thumbUrl || image.url || "/images/placeholder.svg"}
                alt={image.alt || `image-${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                value={image.alt || ""}
                placeholder="Alt текст"
                onChange={(e) => handleAltChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <div className="flex justify-between items-center gap-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 break-words">
                  {image.filename || image.url}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
