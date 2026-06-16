import { defineConfig, devices } from "@playwright/test";

const e2ePort = 3100;
const e2eBaseURL = `http://127.0.0.1:${e2ePort}`;

process.env.E2E_PORT = String(e2ePort);
process.env.E2E_BASE_URL = e2eBaseURL;
process.env.E2E_TEST_MODE = "true";
process.env.NEXT_DIST_DIR = ".next-e2e";
process.env.BETTER_AUTH_URL = e2eBaseURL;
process.env.BETTER_AUTH_SECRET ??=
  "e2e-secret-with-at-least-thirty-two-characters";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.mjs",
  globalTeardown: "./tests/e2e/global-teardown.mjs",
  fullyParallel: false,
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: e2eBaseURL,
    actionTimeout: 10_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
