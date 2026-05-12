import { notFound } from "next/navigation";
import { ensureDbConnection } from "@/app/utils/dbConnection";
import * as accessoryService from "@/app/api/services/accessoryService";
import AccessoryDetailsClient from "./AccessoryDetailsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const normalizeAccessory = (accessory) => {
  if (!accessory) return null;
  return {
    ...JSON.parse(JSON.stringify(accessory)),
    _id: accessory._id?.toString?.() || accessory._id,
    price: Number(accessory.price || 0),
    stock: Number(accessory.stock || 0),
    youtubeUrl: accessory.youtubeUrl || "",
  };
};

async function getAccessory(slug) {
  await ensureDbConnection();
  const accessory = await accessoryService.getAccessoryBySlug(slug);
  return normalizeAccessory(accessory);
}

export async function generateMetadata({ params }) {
  const accessory = await getAccessory(params.slug);

  if (!accessory) {
    return {
      title: "Аксессуар не найден | GoldGames",
      description: "Страница с аксессуаром не найдена.",
    };
  }

  const title = `${accessory.title} — купить игровой аксессуар на GoldGames`;
  const description =
    accessory.description?.slice(0, 160) ||
    "Информация об аксессуаре, цена и характеристики на GoldGames.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/accessories/${params.slug}`,
      type: "product",
      images: [
        {
          url:
            accessory.images?.[0]?.url ||
            accessory.images?.[0]?.thumbUrl ||
            accessory.image ||
            "/images/og-image.png",
          alt: accessory.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        accessory.images?.[0]?.url ||
        accessory.images?.[0]?.thumbUrl ||
        accessory.image ||
        "/images/og-image.png",
      ],
    },
  };
}

export default async function AccessoryDetailsPage({ params }) {
  const accessory = await getAccessory(params.slug);

  if (!accessory) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: accessory.title,
    image: [
      accessory.images?.[0]?.url ||
      accessory.images?.[0]?.thumbUrl ||
      accessory.image ||
      "/images/og-image.png",
    ],
    description: accessory.description,
    sku: accessory._id,
    offers: {
      "@type": "Offer",
      priceCurrency: "KZT",
      price: Number(accessory.price).toString(),
      availability:
        accessory.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/accessories/${params.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <AccessoryDetailsClient accessory={accessory} />
    </>
  );
}
