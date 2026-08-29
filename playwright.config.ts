import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * End-to-end tests run against the real Next.js app, not a standalone copy of
 * it. Vitest already covers the physics (`lib/utils/electrical.ts`) and the
 * components in isolation; what only a browser can check is that a calculator
 * actually opens from the real navigation, inside the real provider chain,
 * with the real `messages/pt.json` strings. Keep this suite small and reserved
 * for exactly that.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? ([["github"], ["html", { open: "never" }]] as const)
    : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `bun run dev --port ${PORT}`,
    url: BASE_URL,
    // Locally this reuses the dev server you already have running.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
