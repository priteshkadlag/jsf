import path from "node:path";
import os from "node:os";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the site and the /admin backend.
 *
 *   npm run build          (once, after code changes)
 *   npx playwright test    (starts `next start` on port 3123 by itself)
 *
 * The tests run against a throwaway content folder and their own admin password, so they never
 * touch the real `content/` folder or `.env.local` password.
 */
const PORT = 3123;
export const E2E_PASSWORD = "e2e-test-password-123";
export const E2E_CONTENT_DIR = path.join(os.tmpdir(), "jsf-e2e-content");

export default defineConfig({
  testDir: "./tests",
  // Tests share one content folder, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "tests/.auth/admin.json" },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { ADMIN_PASSWORD: E2E_PASSWORD, ADMIN_SESSION_SECRET: "e2e-session-secret-for-tests-only", CMS_CONTENT_DIR: E2E_CONTENT_DIR },
  },
});
