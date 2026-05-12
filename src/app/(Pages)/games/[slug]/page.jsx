import { notFound } from "next/navigation";
import { ensureDbConnection } from "@/app/utils/dbConnection";
import * as gameService from "@/app/api/services/gameService";
import GameDetailsClient from "./GameDetailsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  const game = await getGame(params.slug);

  if (!game) {
    return {
      title: "Игра не найдена | GoldGames",
      description: "Страница с игрой не найдена.",
    };
  }

  const title = `${game.title} — купить игру на ${
    game.platforms.join(", ") || "GoldGames"
  }`;
  const description =
    game.description?.slice(0, 160) ||
    "Подробная информация об игре, цена и характеристики на GoldGames.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/games/${params.slug}`,
      type: "article",
      images: [
        {
          url:
            game.images?.[0]?.url ||
            game.images?.[0]?.thumbUrl ||
            game.image ||
            "/images/og-image.png",
          alt: game.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        game.images?.[0]?.url ||
        game.images?.[0]?.thumbUrl ||
        game.image ||
        "/images/og-image.png",
      ],
    },
  };
}

export default async function GameDetailsPage({ params }) {
  const game = await getGame(params.slug);

  if (!game) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: game.title,
    image: [
      game.images?.[0]?.url ||
      game.images?.[0]?.thumbUrl ||
      game.image ||
      "/images/og-image.png",
    ],
    description: game.description,
    sku: game._id,
    offers: {
      "@type": "Offer",
      priceCurrency: "KZT",
      price: Number(game.price).toString(),
      availability:
        game.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/games/${params.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <GameDetailsClient game={game} />
    </>
  );
}
