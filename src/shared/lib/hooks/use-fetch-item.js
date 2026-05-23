import { useState, useEffect } from "react";

export function useFetchItem(url, dataKey) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(data?.error || "Ошибка загрузки");
        if (!data[dataKey]) throw new Error("Элемент не найден");
        setItem(data[dataKey]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [url, dataKey]);

  return { item, loading, error };
}
