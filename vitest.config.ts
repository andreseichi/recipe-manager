import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/image-constraints.ts",
        "src/lib/image-policy.ts",
        "src/lib/pagination.ts",
        "src/lib/validations/recipe.ts",
      ],
    },
  },
});
