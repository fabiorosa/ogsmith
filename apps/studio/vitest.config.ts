import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const core = (path: string) =>
  fileURLToPath(new URL(`../../packages/core/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "ogsmith/raster-wasm", replacement: core("src/raster/wasm.ts") },
      { find: "ogsmith/fonts", replacement: core("fonts") },
      { find: /^ogsmith$/, replacement: core("src/index.ts") },
    ],
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
  },
});
