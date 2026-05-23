"use client";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Затемнение фона с анимацией */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Модальное окно с анимацией */}
        <div className="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full">
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Содержимое с отступами */}
          <div className="px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
