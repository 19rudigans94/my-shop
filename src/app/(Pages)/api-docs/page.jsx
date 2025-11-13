"use client";

import { useEffect, useRef, useState } from "react";

export default function ApiDocsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadSwagger = async () => {
      try {
        // Динамический импорт только на клиенте, минуя strict mode проверки
        if (typeof window !== "undefined") {
          // Загружаем стили
          const styleLink = document.createElement("link");
          styleLink.rel = "stylesheet";
          styleLink.href =
            "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css";
          document.head.appendChild(styleLink);

          // Загружаем SwaggerUIBundle через CDN
          const script = document.createElement("script");
          script.src =
            "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js";
          script.async = true;

          script.onload = () => {
            if (isMounted && window.SwaggerUIBundle) {
              // Загружаем standalone preset
              const standaloneScript = document.createElement("script");
              standaloneScript.src =
                "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js";
              standaloneScript.async = true;

              standaloneScript.onload = () => {
                if (window.SwaggerUIStandalonePreset) {
                  instanceRef.current = window.SwaggerUIBundle({
                    url: "/api/swagger",
                    dom_id: "#swagger-ui",
                    deepLinking: true,
                    presets: [
                      window.SwaggerUIBundle.presets.apis,
                      window.SwaggerUIStandalonePreset,
                    ],
                    plugins: [window.SwaggerUIBundle.plugins.DownloadUrl],
                    layout: "StandaloneLayout",
                    defaultModelsExpandDepth: 1,
                    defaultModelExpandDepth: 1,
                    docExpansion: "list",
                    filter: true,
                    tryItOutEnabled: true,
                  });

                  setIsLoading(false);
                }
              };

              standaloneScript.onerror = () => {
                // Если не удалось загрузить standalone, используем базовый layout
                instanceRef.current = window.SwaggerUIBundle({
                  url: "/api/swagger",
                  dom_id: "#swagger-ui",
                  deepLinking: true,
                  presets: [window.SwaggerUIBundle.presets.apis],
                  defaultModelsExpandDepth: 1,
                  defaultModelExpandDepth: 1,
                  docExpansion: "list",
                  filter: true,
                  tryItOutEnabled: true,
                });

                setIsLoading(false);
              };

              document.body.appendChild(standaloneScript);
            }
          };

          script.onerror = () => {
            setError("Не удалось загрузить Swagger UI");
            setIsLoading(false);
          };

          document.body.appendChild(script);

          return () => {
            if (script.parentNode) {
              document.body.removeChild(script);
            }
            if (styleLink.parentNode) {
              document.head.removeChild(styleLink);
            }
          };
        }
      } catch (err) {
        console.error("Ошибка загрузки Swagger UI:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadSwagger();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            API Документация
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Интерактивная документация API для GoldGames
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Загрузка документации...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">❌ Ошибка: {error}</p>
          </div>
        )}

        <div id="swagger-ui" suppressHydrationWarning />
      </div>
    </div>
  );
}
