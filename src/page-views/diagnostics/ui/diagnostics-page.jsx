"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState({
    paylink: { status: 'checking', message: 'Проверка...', details: null },
    email: { status: 'checking', message: 'Проверка...', details: null },
    database: { status: 'checking', message: 'Проверка...', details: null },
    environment: { status: 'checking', message: 'Проверка...', details: null }
  });
  
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    // Сброс состояния
    setDiagnostics({
      paylink: { status: 'checking', message: 'Проверка PayLink API...', details: null },
      email: { status: 'checking', message: 'Проверка Email системы...', details: null },
      database: { status: 'checking', message: 'Проверка базы данных...', details: null },
      environment: { status: 'checking', message: 'Проверка переменных окружения...', details: null }
    });

    // Проверка переменных окружения
    try {
      const envResponse = await fetch('/api/diagnostics/environment');
      const envData = await envResponse.json();
      
      setDiagnostics(prev => ({
        ...prev,
        environment: {
          status: envData.success ? 'success' : 'error',
          message: envData.success ? 'Переменные окружения настроены' : 'Проблемы с переменными окружения',
          details: envData
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        environment: {
          status: 'error',
          message: 'Ошибка проверки переменных окружения',
          details: { error: error.message }
        }
      }));
    }

    // Проверка PayLink
    try {
      const paylinkResponse = await fetch('/api/paylink/status');
      const paylinkData = await paylinkResponse.json();
      
      setDiagnostics(prev => ({
        ...prev,
        paylink: {
          status: paylinkData.success ? 'success' : 'error',
          message: paylinkData.success ? 'PayLink API доступен' : 'PayLink API недоступен',
          details: paylinkData
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        paylink: {
          status: 'error',
          message: 'Ошибка подключения к PayLink',
          details: { error: error.message }
        }
      }));
    }

    // Проверка Email системы
    try {
      const emailResponse = await fetch('/api/email/status');
      const emailData = await emailResponse.json();
      
      setDiagnostics(prev => ({
        ...prev,
        email: {
          status: emailData.success ? 'success' : 'error',
          message: emailData.success ? 'Email система работает' : 'Проблемы с Email системой',
          details: emailData
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        email: {
          status: 'error',
          message: 'Ошибка проверки Email системы',
          details: { error: error.message }
        }
      }));
    }

    // Проверка базы данных
    try {
      const dbResponse = await fetch('/api/diagnostics/database');
      const dbData = await dbResponse.json();
      
      setDiagnostics(prev => ({
        ...prev,
        database: {
          status: dbData.success ? 'success' : 'error',
          message: dbData.success ? 'База данных подключена' : 'Проблемы с базой данных',
          details: dbData
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        database: {
          status: 'error',
          message: 'Ошибка подключения к базе данных',
          details: { error: error.message }
        }
      }));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Диагностика платежной системы
        </h1>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Проверка...' : 'Повторить проверку'}
        </button>
      </div>

      <div className="grid gap-6">
        {Object.entries(diagnostics).map(([key, diagnostic]) => (
          <div
            key={key}
            className={`border rounded-lg p-6 ${getStatusColor(diagnostic.status)}`}
          >
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(diagnostic.status)}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {key === 'paylink' && 'PayLink API'}
                {key === 'email' && 'Email система'}
                {key === 'database' && 'База данных'}
                {key === 'environment' && 'Переменные окружения'}
              </h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {diagnostic.message}
            </p>

            {diagnostic.details && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Подробности
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {JSON.stringify(diagnostic.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Тестовая секция для PayLink */}
      <div className="mt-8 border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Тест создания платежа
        </h2>
        <TestPaymentCreation />
      </div>
    </div>
  );
}

function TestPaymentCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState(null);

  const createTestPayment = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      const testCartData = {
        totalPrice: 1000,
        totalItems: 1,
        items: [
          {
            id: 'test-item-1',
            title: 'Тестовый товар',
            price: 1000,
            quantity: 1,
            platform: 'PS5',
            type: 'game'
          }
        ],
        customerInfo: {
          email: 'diag@test.local',
          phoneNumber: '+7 777 000 00 00'
        }
      };

      const response = await fetch('/api/paylink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartData: testCartData }),
      });

      const data = await response.json();
      setResult({
        success: response.ok,
        status: response.status,
        data: data
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <button
        onClick={createTestPayment}
        disabled={isCreating}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        {isCreating ? 'Создание тестового платежа...' : 'Создать тестовый платеж'}
      </button>

      {result && (
        <div className="mt-4">
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <h3 className="font-semibold mb-2">
              {result.success ? '✅ Тест успешен' : '❌ Тест не пройден'}
            </h3>
            {result.success && result.data?.data?.pay_url && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ссылка для оплаты создана:
                </p>
                <a 
                  href={result.data.data.pay_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {result.data.data.pay_url}
                </a>
              </div>
            )}
            <details>
              <summary className="cursor-pointer text-sm">Подробности</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}