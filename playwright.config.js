const { defineConfig } = require("@playwright/test");
const fs = require("node:fs");
const executablePath = process.env.TEST_BROWSER_PATH || (fs.existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined);
module.exports = defineConfig({
  testDir: "./e2e", timeout: 45000, workers: 1, fullyParallel: false,
  reporter: "list", outputDir: "/tmp/technozion-scroll-results",
  use: { baseURL: "http://127.0.0.1:4317", viewport: { width: 1440, height: 900 }, browserName: "chromium", launchOptions: { executablePath, args: ["--no-sandbox"] }, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "node scripts/serve-build.cjs", url: "http://127.0.0.1:4317", reuseExistingServer: false, timeout: 10000 },
});
