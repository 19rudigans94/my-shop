"use client";

import { useRouter } from "next/navigation";
import ConsoleCard from "@/entities/console/ui";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ErrorDisplay from "@/shared/ui/error-display";
import { useFetchItems } from "@/shared/lib/hooks/use-fetch-items";

export default function ConsolePage() {
  const router = useRouter();
  const { items: consoles, loading, error } = useFetchItems("/api/consoles", "consoles");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

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
