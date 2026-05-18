import { notFound } from "next/navigation";
import { ensureDbConnection } from "@/app/utils/dbConnection";
import * as gameService from "@/app/api/services/gameService";
import GameDetailsClient from "./GameDetailsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goldgames.kz";
const DEFAULT_IMAGE = "https://goldgames.kz/images/og-image.png";

const normalizeImageUrl = (url) => {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return url;
};

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
      url: `${SITE_URL}/games/${slug}`,
      type: "article",
      images: [
        {
          url: normalizeImageUrl(
            game.images?.[0]?.url ||
              game.images?.[0]?.thumbUrl ||
              game.image ||
              DEFAULT_IMAGE
          ),
          alt: game.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        normalizeImageUrl(
          game.images?.[0]?.url ||
            game.images?.[0]?.thumbUrl ||
            game.image ||
            DEFAULT_IMAGE
        ),
      ],
    },
  };
}

export default async function GameDetailsPage({ params }) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: game.title,
    image: [
      normalizeImageUrl(
        game.images?.[0]?.url ||
          game.images?.[0]?.thumbUrl ||
          game.image ||
          DEFAULT_IMAGE
      ),
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
      url: `${SITE_URL}/games/${slug}`,
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
