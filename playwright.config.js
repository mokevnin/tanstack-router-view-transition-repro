import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // The installed Chrome, so no browser download is needed (`npx playwright install chromium`
  // and removing `channel` works too).
  use: { baseURL: 'http://localhost:5199', channel: 'chrome' },
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: true,
  },
})
