"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GameCard from "@/entities/game/ui";

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/games");
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Ошибка загрузки игр");
        setGames(data.games);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
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
        {games.map((game) => (
          <GameCard
            key={game._id}
            game={game}
            onClick={() => router.push(`/games/${game.slug}`)}
          />
        ))}
      </div>
    </div>
  );
}
