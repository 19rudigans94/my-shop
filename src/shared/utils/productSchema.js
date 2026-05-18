import { SITE_URL, getFirstImageUrl } from "./imageUtils.js";

export function createProductSchema(item, type, slug) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: item.title,
    image: [getFirstImageUrl(item)],
    description: item.description,
    sku: item._id,
    offers: {
      "@type": "Offer",
      priceCurrency: "KZT",
      price: Number(item.price || 0).toString(),
      availability:
        (item.stock || 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/${type}/${slug}`,
    },
  };
}
