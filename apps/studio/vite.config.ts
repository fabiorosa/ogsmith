import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Served from https://fabiorosa.github.io/ogsmith/ on GitHub Pages.
  base: process.env.STUDIO_BASE ?? "/",
  server: {
    port: 3109,
  },
});
