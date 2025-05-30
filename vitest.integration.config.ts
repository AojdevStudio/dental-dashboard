import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    name: "integration",
    include: [
      "src/**/__tests__/integration/**/*.test.ts",
      "src/**/__tests__/performance/**/*.test.ts",
      "src/**/__tests__/security/**/*.test.ts",
    ],
    globals: true,
    environment: "node",
    setupFiles: ["./src/vitest-setup.integration.ts"],
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 60000, // 60 seconds for setup/teardown
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially to avoid conflicts
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/**/*.test.ts", "src/**/__tests__/**", "src/**/__mocks__/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
