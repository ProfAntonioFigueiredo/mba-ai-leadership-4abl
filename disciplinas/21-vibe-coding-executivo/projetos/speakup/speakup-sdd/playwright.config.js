import { defineConfig } from "@playwright/test";
const baseline = process.env.SPEAKUP_BASELINE_UI;
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5174",
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: baseline
      ? "node node_modules/vite/bin/vite.js " +
        JSON.stringify(baseline) +
        " --host 127.0.0.1 --port 5174 --strictPort"
      : "npm run dev -- --strictPort",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: false,
  },
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: baseline
          ? "reports/browser-baseline.json"
          : "reports/browser-sdd.json",
      },
    ],
  ],
});
