import { useState, useEffect, useCallback } from "react";

export function useFetchItems(url, dataKey) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.error || "Ошибка загрузки");
      setItems(data[dataKey] ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, dataKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}
