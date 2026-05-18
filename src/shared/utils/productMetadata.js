import { SITE_URL, getFirstImageUrl } from "./imageUtils.js";

export function createProductMetadata(item, type, slug, options = {}) {
  const {
    titleSuffix = "",
    notFoundTitle = "Товар не найден | GoldGames",
    notFoundDescription = "Страница товара не найдена.",
    fallbackDescription = "Подробная информация о товаре, цена и характеристики на GoldGames.",
  } = options;

  if (!item) {
    return { title: notFoundTitle, description: notFoundDescription };
  }

  const title = `${item.title} ${titleSuffix}`.trim();
  const description = item.description?.slice(0, 160) || fallbackDescription;
  const imageUrl = getFirstImageUrl(item);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${type}/${slug}`,
      type: "website",
      images: [{ url: imageUrl, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
