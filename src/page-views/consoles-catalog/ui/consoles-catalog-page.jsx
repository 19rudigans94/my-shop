"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConsoleCard from "@/entities/console/ui";

export default function ConsolePage() {
  const router = useRouter();
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsoles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/consoles");
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Ошибка загрузки консолей");
        setConsoles(data.consoles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsoles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {consoles.map((console) => (
          <ConsoleCard
            key={console._id}
            console={console}
            onClick={() => router.push(`/consoles/${console.slug}`)}
          />
        ))}
      </div>
    </div>
  );
}
