"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

const SUBJECTS = [
  "Вопрос о заказе",
  "Технические вопросы",
  "Предложение",
  "Другое",
];

const baseInput =
  "w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 " +
  "bg-white dark:bg-gray-700 text-gray-900 dark:text-white " +
  "focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors disabled:opacity-60";

const errorInput =
  "border-red-400 dark:border-red-500 focus:ring-red-400";

function validate({ name, email, message }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = "Минимум 2 символа";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Некорректный email";
  if (!message || message.trim().length < 10) errors.message = "Минимум 10 символов";
  return errors;
}

export function FeedbackForm() {
  const [fields, setFields] = useState({
    subject: SUBJECTS[0],
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState("idle");
  const [serverError, setServerError] = useState(null);

  const isLoading = submitState === "loading";

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitState("loading");
    setServerError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка при отправке");
      setSubmitState("success");
    } catch (err) {
      setServerError(err.message);
      setSubmitState("error");
    }
  }

  function handleReset() {
    setFields({ subject: SUBJECTS[0], name: "", email: "", message: "" });
    setErrors({});
    setSubmitState("idle");
    setServerError(null);
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center text-center py-12 animate-fade-in-up">
        <CheckCircle size={56} className="text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Сообщение отправлено!
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Спасибо за обращение. Мы ответим в течение рабочего дня.
        </p>
        <button onClick={handleReset} className="btn-primary">
          Отправить ещё
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {serverError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Тема обращения
        </label>
        <select
          id="subject"
          name="subject"
          value={fields.subject}
          onChange={handleChange}
          className={baseInput}
          disabled={isLoading}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Ваше имя
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={fields.name}
          onChange={handleChange}
          placeholder="Иван Иванов"
          className={`${baseInput} ${errors.name ? errorInput : ""}`}
          minLength={2}
          maxLength={50}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={fields.email}
          onChange={handleChange}
          placeholder="ivan@example.com"
          className={`${baseInput} ${errors.email ? errorInput : ""}`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Сообщение
          </label>
          <span
            className={`text-xs ${
              fields.message.length > 900 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {fields.message.length} / 1000
          </span>
        </div>
        <textarea
          id="message"
          name="message"
          value={fields.message}
          onChange={handleChange}
          rows={6}
          placeholder="Опишите ваш вопрос или предложение..."
          className={`${baseInput} resize-none ${errors.message ? errorInput : ""}`}
          minLength={10}
          maxLength={1000}
          disabled={isLoading}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Отправка...
          </>
        ) : (
          "Отправить сообщение"
        )}
      </button>
    </form>
  );
}
