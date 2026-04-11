import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/routes/**/*.ts"],
      exclude: ["src/__tests__/**"],
    },
    alias: {
      "@workspace/db": new URL("./src/__tests__/__mocks__/@workspace/db.ts", import.meta.url).pathname,
    },
  },
});
