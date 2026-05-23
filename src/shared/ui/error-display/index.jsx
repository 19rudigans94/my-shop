export default function ErrorDisplay({ error, inline = false }) {
  if (inline) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
        Ошибка: {error}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Ошибка: {error}</div>
    </div>
  );
}
