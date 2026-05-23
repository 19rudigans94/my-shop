"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { ToastContext } from "./toast-context";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-yellow-500",
};

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const Icon = ICONS[toast.type] ?? Info;

  return (
    <div
      className={`flex items-start gap-3 ${STYLES[toast.type] ?? "bg-gray-700"} text-white px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-sm`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

let _nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration) => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const toast = {
    success: (msg, duration) => addToast("success", msg, duration),
    error: (msg, duration) => addToast("error", msg, duration),
    info: (msg, duration) => addToast("info", msg, duration),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export { useToast } from "./toast-context";
