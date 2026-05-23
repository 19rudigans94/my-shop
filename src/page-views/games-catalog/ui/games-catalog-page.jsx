"use client";

import { useRouter } from "next/navigation";
import GameCard from "@/entities/game/ui";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ErrorDisplay from "@/shared/ui/error-display";
import { useFetchItems } from "@/shared/lib/hooks/use-fetch-items";

export default function GamesPage() {
  const router = useRouter();
  const { items: games, loading, error } = useFetchItems("/api/games", "games");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

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
