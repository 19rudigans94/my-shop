"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccessoryCard from "@/entities/accessory/ui";
import LoadingSpinner from "@/shared/ui/loading-spinner";
import ErrorDisplay from "@/shared/ui/error-display";

export default function AccessoriesPage() {
  const router = useRouter();
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.append("page", pagination.page);
        queryParams.append("limit", pagination.limit);

        const response = await fetch(`/api/accessories?${queryParams.toString()}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Ошибка загрузки аксессуаров");
        }

        setAccessories(data.accessories || []);
        setPagination(
          data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 }
        );
      } catch (err) {
        setError(err.message);
        setAccessories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessories();
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessories.map((accessory) => (
            <AccessoryCard
              key={accessory._id}
              accessory={accessory}
              onClick={() => router.push(`/accessories/${accessory.slug}`)}
            />
          ))}
        </div>
      );
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${
                  pagination.page === page
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
