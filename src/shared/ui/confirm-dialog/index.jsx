"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "@/shared/ui/modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтвердите действие",
  message = "Вы уверены?",
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  confirmVariant = "danger",
}) {
  const confirmStyles =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-yellow-500 hover:bg-yellow-600 text-gray-900";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmStyles}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
