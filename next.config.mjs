/** @type {import('next').NextConfig} */
const nextConfig = {
  // Устанавливаем стартовую страницу проекта
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/games",
        permanent: true,
      },
    ];
  },
  // Отключаем оптимизацию изображений
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
