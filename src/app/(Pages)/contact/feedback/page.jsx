import { FeedbackForm } from "./components/FeedbackForm";

export const metadata = {
  title: "Обратная связь | GoldGames",
  description: "Свяжитесь с нами - мы всегда рады помочь",
};

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Обратная связь
      </h2>
      <FeedbackForm />
    </div>
  );
}
