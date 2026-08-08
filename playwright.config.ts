import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8765',
    headless: true,
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: 'python -m http.server 8765',
    url: 'http://localhost:8765',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
