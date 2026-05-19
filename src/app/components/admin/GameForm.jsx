"use client";

import { useState, useEffect } from "react";

const PLATFORMS = [
  "PS5",
  "PS4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Nintendo Switch Lite",
  "PC",
];

export default function GameForm({ game, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platforms: [],
    image: "",
    youtubeUrl: "",
    features: [],
    genre: [],
  });

  useEffect(() => {
    if (game) {
      const newState = {
        title: game.title || "",
        description: game.description || "",
        platforms: game.platforms || [],
        image: game.image || "",
        youtubeUrl: game.youtubeUrl || "",
        features: game.features || [],
        genre: Array.isArray(game.genre) ? game.genre : [],
      };
      setFormData(newState);
    }
  }, [game]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Добавляем валидацию и логирование
    console.log("Отправка формы:", formData);

    // Проверяем все обязательные поля
    const requiredFields = {
      title: "Название",
      description: "Описание",
      image: "URL изображения",
      youtubeUrl: "URL YouTube видео",
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (emptyFields.length > 0) {
      alert(`Пожалуйста, заполните следующие поля: ${emptyFields.join(", ")}`);
      return;
    }

    // Конвертируем YouTube URL в формат для встраивания
    const youtubeUrl = formData.youtubeUrl;
    let embedUrl = youtubeUrl;

    try {
      if (youtubeUrl.includes("youtube.com/watch?v=")) {
        const videoId = youtubeUrl.split("v=")[1].split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (youtubeUrl.includes("youtu.be/")) {
        const videoId = youtubeUrl.split("youtu.be/")[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      const submitData = {
        ...formData,
        youtubeUrl: embedUrl,
      };

      console.log("Отправляем данные:", submitData);
      onSubmit(submitData);
    } catch (error) {
      console.error("Ошибка при обработке формы:", error);
      alert(
        "Произошла ошибка при обработке формы. Проверьте правильность заполнения полей."
      );
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

  // const handleFeatureRemove = (index) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     features: prev.features.filter((_, i) => i !== index),
  //   }));
  // };

  const handleGenreAdd = () => {
    setFormData((prev) => {
      const newState = {
        ...prev,
        genre: Array.isArray(prev.genre) ? [...prev.genre, ""] : [""],
      };
      return newState;
    });
  };

  const handleGenreChange = (index, value) => {
    setFormData((prev) => {
      const genres = Array.isArray(prev.genre) ? [...prev.genre] : [];
      genres[index] = value;
      return { ...prev, genre: genres };
    });
  };

  const handleGenreRemove = (index) => {
    setFormData((prev) => {
      const newState = {
        ...prev,
        genre: Array.isArray(prev.genre)
          ? prev.genre.filter((_, i) => i !== index)
          : [],
      };
      return newState;
    });
  };

  const togglePlatform = (platform) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
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
            URL YouTube видео
          </label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Платформы
        </label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <label
              key={platform}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.platforms.includes(platform)}
                onChange={() => togglePlatform(platform)}
                className="sr-only"
              />
              <span
                className={`px-3 py-1 rounded-full ${
                  formData.platforms.includes(platform)
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {platform}
              </span>
            </label>
          ))}
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

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Жанры
          </label>
          <button
            type="button"
            onClick={handleGenreAdd}
            className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            + Добавить жанр
          </button>
        </div>
        <div className="space-y-2">
          {formData.genre.map((genre, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={genre}
                onChange={(e) => handleGenreChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Введите жанр"
              />
              <button
                type="button"
                onClick={() => handleGenreRemove(index)}
                className="px-3 py-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
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
          {game ? "Сохранить изменения" : "Создать игру"}
        </button>
      </div>
    </form>
  );
}
