import { notFound } from "next/navigation";
import { ensureDbConnection } from "@/shared/lib/dbConnection.js";
import * as gameService from "@/entities/game/api/gameService.js";
import { createProductSchema } from "@/shared/utils/productSchema.js";
import { createProductMetadata } from "@/shared/utils/productMetadata.js";
import { GameDetailsClient } from "@/widgets/game-details";

const normalizeGame = (game) => {
  if (!game) return null;
  return {
    ...JSON.parse(JSON.stringify(game)),
    _id: game._id?.toString?.() || game._id,
    price: Number(game.price || 0),
    stock: Number(game.stock || 0),
    platforms: game.platforms || [],
    genre: game.genre || [],
    youtubeUrl: game.youtubeUrl || "",
  };
};

async function getGame(slug) {
  await ensureDbConnection();
  const game = await gameService.getGameBySlug(slug);
  return normalizeGame(game);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = await getGame(slug);

  const titleSuffix = `— купить игру на ${game?.platforms?.join(", ") || "GoldGames"}`;

  return createProductMetadata(game, "games", slug, {
    titleSuffix,
    notFoundTitle: "Игра не найдена | GoldGames",
    notFoundDescription: "Страница с игрой не найдена.",
    fallbackDescription: "Подробная информация об игре, цена и характеристики на GoldGames.",
  });
}

export default async function GameDetailsPage({ params }) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(createProductSchema(game, "games", slug)) }}
      />
      <GameDetailsClient game={game} />
    </>
  );
}
