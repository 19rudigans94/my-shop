import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = (p = "") => path.resolve(__dirname, "src", p);

export default defineConfig({
  resolve: {
    // Те же алиасы, что в jsconfig.json / next.config.mjs
    alias: {
      "@shared": src("shared"),
      "@entities": src("entities"),
      "@features": src("features"),
      "@widgets": src("widgets"),
      "@page-views": src("page-views"),
      "@": src(),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}"],
    restoreMocks: true,
    // Тесты не должны ходить в реальную БД / PayLink / почту
    env: {
      MONGODB_URI: "",
      PAYLINK_SHOP_ID: "",
      PAYLINK_SHOP_SECRET: "",
    },
  },
});
