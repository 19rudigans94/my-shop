import { ensureDbConnection } from "@/shared/lib/dbConnection.js";
import * as gameService from "@/entities/game/api/gameService.js";
import * as consoleService from "@/entities/console/api/consoleService.js";
import * as accessoryService from "@/entities/accessory/api/accessoryService.js";

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
