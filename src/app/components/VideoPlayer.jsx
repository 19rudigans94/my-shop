"use client";

export default function VideoPlayer({ url, title }) {
  // Функция для конвертации YouTube URL в формат для встраивания
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // Если URL уже в формате embed, возвращаем его
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    // Извлекаем ID видео из разных форматов URL
    let videoId = "";

    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
    }

    // Если ID найден, возвращаем URL для встраивания
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      {/* <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Трейлер
      </h2> */}
      <div className="aspect-video w-full relative rounded-xl overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title={title}
          style={{ border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
