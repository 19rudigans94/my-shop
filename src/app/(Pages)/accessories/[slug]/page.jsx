import { notFound } from "next/navigation";
import { ensureDbConnection } from "@/shared/lib/dbConnection.js";
import * as accessoryService from "@/entities/accessory/api/accessoryService.js";
import { createProductSchema } from "@/shared/utils/productSchema.js";
import { createProductMetadata } from "@/shared/utils/productMetadata.js";
import { AccessoryDetailsClient } from "@/widgets/accessory-details";

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
  const { slug } = await params;
  const accessory = await getAccessory(slug);

  return createProductMetadata(accessory, "accessories", slug, {
    titleSuffix: "— купить игровой аксессуар на GoldGames",
    notFoundTitle: "Аксессуар не найден | GoldGames",
    notFoundDescription: "Страница с аксессуаром не найдена.",
    fallbackDescription: "Информация об аксессуаре, цена и характеристики на GoldGames.",
  });
}

export default async function AccessoryDetailsPage({ params }) {
  const { slug } = await params;
  const accessory = await getAccessory(slug);

  if (!accessory) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(createProductSchema(accessory, "accessories", slug)) }}
      />
      <AccessoryDetailsClient accessory={accessory} />
    </>
  );
}
