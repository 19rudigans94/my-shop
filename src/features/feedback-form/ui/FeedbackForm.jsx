"use client";

import { useState } from "react";

const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const MESSAGE_MAX = 1000;
const MESSAGE_WARN = 900;

export function FeedbackForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email" && emailError) setEmailError("");
  };

  const handleEmailBlur = () => {
    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      setEmailError("Введите корректный email адрес");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(formData.email)) {
      setEmailError("Введите корректный email адрес");
      return;
    }

    try {
      setStatus({ loading: true, success: false, error: null });
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ошибка при отправке сообщения");
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({ loading: false, success: false, error: error.message || "Произошла ошибка при отправке сообщения" });
    }
  };

  const msgLength = formData.message.length;
  const counterColor =
    msgLength > MESSAGE_WARN
      ? "text-red-500"
      : msgLength > MESSAGE_WARN - 100
      ? "text-yellow-500"
      : "text-gray-400 dark:text-gray-500";

  return (
    <div className="space-y-4">
      {status.success && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
          Сообщение успешно отправлено! Спасибо за обратную связь.
        </div>
      )}
      {status.error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Ваше имя
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
            required
            minLength={2}
            maxLength={50}
            disabled={status.loading}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
              emailError
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600"
            }`}
            required
            disabled={status.loading}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">{emailError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Сообщение
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none"
            required
            minLength={10}
            maxLength={MESSAGE_MAX}
            disabled={status.loading}
          />
          <p className={`mt-1 text-xs text-right ${counterColor}`}>
            {msgLength}/{MESSAGE_MAX}
          </p>
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.loading ? "Отправка..." : "Отправить сообщение"}
        </button>
      </form>
    </div>
  );
}
