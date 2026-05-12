import { ensureDbConnection } from "@/app/utils/dbConnection";
import * as gameService from "@/app/api/services/gameService";
import * as consoleService from "@/app/api/services/consoleService";
import * as accessoryService from "@/app/api/services/accessoryService";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goldgames.kz";

const staticRoutes = [
  { url: `${SITE_URL}/games`, lastModified: new Date().toISOString() },
  { url: `${SITE_URL}/consoles`, lastModified: new Date().toISOString() },
  { url: `${SITE_URL}/accessories`, lastModified: new Date().toISOString() },
  { url: `${SITE_URL}/contact`, lastModified: new Date().toISOString() },
  { url: `${SITE_URL}/cart`, lastModified: new Date().toISOString() },
];

const buildRouteList = (items, prefix) =>
  items.map((item) => ({
    url: `${SITE_URL}/${prefix}/${item.slug}`,
    lastModified:
      item.updatedAt?.toISOString() || item.createdAt?.toISOString() || new Date().toISOString(),
  }));

export default async function sitemap() {
  try {
    await ensureDbConnection();

    const [games, consoles, accessories] = await Promise.all([
      gameService.getAllGames(),
      consoleService.getAllConsoles(),
      accessoryService.getAllAccessories(),
    ]);

    return [
      ...staticRoutes,
      ...buildRouteList(games, "games"),
      ...buildRouteList(consoles, "consoles"),
      ...buildRouteList(accessories, "accessories"),
    ];
  } catch (error) {
    console.warn(
      "Sitemap generation skipped dynamic content because the database is unavailable:",
      error?.message || error
    );
    return [...staticRoutes];
  }
}
