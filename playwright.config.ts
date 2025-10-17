import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for mobile UX regression testing
 *
 * This configuration ensures that mobile improvements are tested across
 * multiple viewports and browsers to prevent regressions.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5040',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Mobile viewports - critical for mobile UX testing
    {
      name: 'Mobile Chrome - iPhone SE (320px)',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 320, height: 568 },
      },
    },
    {
      name: 'Mobile Chrome - iPhone 12 (390px)',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Mobile Chrome - iPhone 14 Pro Max (430px)',
      use: {
        ...devices['iPhone 14 Pro Max'],
        viewport: { width: 430, height: 932 },
      },
    },
    {
      name: 'Mobile Safari - iPhone 12',
      use: {
        ...devices['iPhone 12'],
      },
    },

    // Tablet viewports
    {
      name: 'Tablet - iPad (768px)',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'Tablet - iPad Pro (1024px)',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 1024, height: 1366 },
      },
    },

    // Desktop viewports - ensure no regressions
    {
      name: 'Desktop Chrome (1280px)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Desktop Chrome (1920px)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // WebKit for Safari compatibility
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5040',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
