export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goldgames.kz";
export const DEFAULT_IMAGE = "https://goldgames.kz/images/og-image.png";

export function normalizeImageUrl(url) {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return url;
}

export function getFirstImageUrl(item) {
  return normalizeImageUrl(
    item?.images?.[0]?.url || item?.images?.[0]?.thumbUrl || item?.image
  );
}
