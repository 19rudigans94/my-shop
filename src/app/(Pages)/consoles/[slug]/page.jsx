import { notFound } from "next/navigation";
import { ensureDbConnection } from "@/shared/lib/dbConnection.js";
import * as consoleService from "@/entities/console/api/consoleService.js";
import { createProductSchema } from "@/shared/utils/productSchema.js";
import { createProductMetadata } from "@/shared/utils/productMetadata.js";
import { ConsoleDetailsClient } from "@/widgets/console-details";

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

  return createProductMetadata(consoleItem, "consoles", slug, {
    titleSuffix: "— купить игровую консоль на GoldGames",
    notFoundTitle: "Консоль не найдена | GoldGames",
    notFoundDescription: "Страница с консолью не найдена.",
    fallbackDescription: "Информация о консоли, цена и технические характеристики на GoldGames.",
  });
}

export default async function ConsoleDetailsPage({ params }) {
  const { slug } = await params;
  const consoleItem = await getConsole(slug);

  if (!consoleItem) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(createProductSchema(consoleItem, "consoles", slug)) }}
      />
      <ConsoleDetailsClient console={consoleItem} />
    </>
  );
}
