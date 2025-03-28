"use client";

import { useState, useEffect } from "react";

export default function Admin() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/protected/games");
        if (!response.ok) {
          throw new Error("Ошибка при загрузке данных");
        }
        const data = await response.json();
        setGames(data.games);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="text-red-500 mb-4">Ошибка: {error.message}</div>
      )}
      {loading ? (
        <div className="text-gray-500">Загрузка...</div>
      ) : (
        <div>
          <ul>
            {games.map((game) => (
              <li className="border rounded-lg p-4 m-1" key={game._id}>
                {game.title} <br />
                {game.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
