import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.TARGET_URL || "https://sharestrata.com",
    screenshot: "on",
    trace: "retain-on-failure",
    actionTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
  reporter: [["list"]],
});
