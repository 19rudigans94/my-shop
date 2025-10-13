"use client";

import { useState } from "react";

export default function TestVerificationPage() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testVerificationEndpoint = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Тестируем с успешным статусом
      const testUrl = `/api/paylink/verification?status=successful&uid=test-uid-${Date.now()}&amount=100&paymentId=test-payment`;

      console.log("🧪 Тестирование verification endpoint:", testUrl);

      const response = await fetch(testUrl, {
        method: "GET",
        redirect: "manual", // Не следуем редиректам автоматически
      });

      console.log("📨 Ответ от verification API:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.status === 302 || response.status === 307) {
        const location = response.headers.get("location");
        setTestResult({
          success: true,
          message: "Verification endpoint работает корректно",
          redirectTo: location,
          status: response.status,
        });
      } else {
        const result = await response.text();
        setTestResult({
          success: false,
          message: "Неожиданный ответ от verification endpoint",
          response: result,
          status: response.status,
        });
      }
    } catch (error) {
      console.error("❌ Ошибка тестирования verification:", error);
      setTestResult({
        success: false,
        message: "Ошибка при тестировании verification endpoint",
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        🧪 Тестирование PayLink Verification
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Проверка verification endpoint
        </h2>

        <button
          onClick={testVerificationEndpoint}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Тестирование...</span>
            </div>
          ) : (
            "🧪 Протестировать verification endpoint"
          )}
        </button>
      </div>

      {testResult && (
        <div
          className={`rounded-lg shadow-md p-6 ${
            testResult.success
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              testResult.success
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {testResult.success ? "✅ Тест пройден" : "❌ Тест не пройден"}
          </h3>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Сообщение:</strong> {testResult.message}
            </p>
            {testResult.status && (
              <p>
                <strong>HTTP статус:</strong> {testResult.status}
              </p>
            )}
            {testResult.redirectTo && (
              <p>
                <strong>Перенаправление на:</strong> {testResult.redirectTo}
              </p>
            )}
            {testResult.error && (
              <p>
                <strong>Ошибка:</strong> {testResult.error}
              </p>
            )}
            {testResult.response && (
              <div>
                <strong>Ответ:</strong>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                  {testResult.response}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
          📋 Инструкции по диагностике
        </h3>
        <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
          <p>1. Нажмите кнопку выше для тестирования verification endpoint</p>
          <p>2. Проверьте, что endpoint возвращает статус 302 (редирект)</p>
          <p>3. Убедитесь, что PayLink может достучаться до вашего сервера</p>
          <p>4. Проверьте переменную окружения PAYLINK_RETURN_URL</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a
          href="/success"
          className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Вернуться к success
        </a>
      </div>
    </div>
  );
}
