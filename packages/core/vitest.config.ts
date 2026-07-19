import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Determinism tests hash render output; keep a single environment.
    environment: "node",
  },
});
