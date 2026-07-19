import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const core = (path: string) =>
  fileURLToPath(new URL(`../../packages/core/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Served from https://fabiorosa.github.io/ogsmith/ on GitHub Pages.
  base: process.env.STUDIO_BASE ?? "/",
  define: {
    // satori's browser build still reads process.env.NODE_ENV.
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    // The studio consumes the engine's TypeScript source directly so dev
    // and CI never depend on a prebuilt dist. Order matters: specific
    // subpaths before the package root.
    alias: [
      { find: "ogsmith/raster-wasm", replacement: core("src/raster/wasm.ts") },
      { find: "ogsmith/fonts", replacement: core("fonts") },
      { find: /^ogsmith$/, replacement: core("src/index.ts") },
    ],
  },
  server: {
    port: 3109,
  },
});
