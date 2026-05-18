import { notFound } from "next/navigation";
import { ensureDbConnection } from "@/app/utils/dbConnection";
import * as consoleService from "@/app/api/services/consoleService";
import ConsoleDetailsClient from "./ConsoleDetailsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goldgames.kz";
const DEFAULT_IMAGE = "https://goldgames.kz/images/og-image.png";

const normalizeImageUrl = (url) => {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return url;
};

const normalizeConsole = (consoleItem) => {
  if (!consoleItem) return null;
  return {
    ...JSON.parse(JSON.stringify(consoleItem)),
    _id: consoleItem._id?.toString?.() || consoleItem._id,
    price: Number(consoleItem.price || 0),
    stock: Number(consoleItem.stock || 0),
    youtubeUrl: consoleItem.youtubeUrl || "",
  };
};

async function getConsole(slug) {
  await ensureDbConnection();
  const consoleItem = await consoleService.getConsoleBySlug(slug);
  return normalizeConsole(consoleItem);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const consoleItem = await getConsole(slug);

  if (!consoleItem) {
    return {
      title: "Консоль не найдена | GoldGames",
      description: "Страница с консолью не найдена.",
    };
  }

  const title = `${consoleItem.title} — купить игровую консоль на GoldGames`;
  const description =
    consoleItem.description?.slice(0, 160) ||
    "Информация о консоли, цена и технические характеристики на GoldGames.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/consoles/${slug}`,
      type: "article",
      images: [
        {
          url: normalizeImageUrl(
            consoleItem.images?.[0]?.url ||
              consoleItem.images?.[0]?.thumbUrl ||
              consoleItem.image ||
              DEFAULT_IMAGE
          ),
          alt: consoleItem.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        normalizeImageUrl(
          consoleItem.images?.[0]?.url ||
            consoleItem.images?.[0]?.thumbUrl ||
            consoleItem.image ||
            DEFAULT_IMAGE
        ),
      ],
    },
  };
}

export default async function ConsoleDetailsPage({ params }) {
  const { slug } = await params;
  const consoleItem = await getConsole(slug);

  if (!consoleItem) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: consoleItem.title,
    image: [
      normalizeImageUrl(
        consoleItem.images?.[0]?.url ||
          consoleItem.images?.[0]?.thumbUrl ||
          consoleItem.image ||
          DEFAULT_IMAGE
      ),
    ],
    description: consoleItem.description,
    sku: consoleItem._id,
    offers: {
      "@type": "Offer",
      priceCurrency: "KZT",
      price: Number(consoleItem.price).toString(),
      availability:
        consoleItem.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/consoles/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ConsoleDetailsClient console={consoleItem} />
    </>
  );
}
