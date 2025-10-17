import { test, expect } from '@playwright/test';
import { VIEWPORTS } from './utils/viewport-helpers';

/**
 * Visual Regression Tests
 *
 * Takes screenshots at key viewports and compares them to baseline images.
 * This helps catch unintended visual changes to the mobile UX.
 *
 * Usage:
 * - First run: Creates baseline screenshots
 * - Subsequent runs: Compares against baseline
 * - Update baselines: pnpm test:visual:update
 */

test.describe('Visual Regression - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Viewports', () => {
    test('should match baseline at 320px (iPhone SE)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);
      await page.waitForTimeout(500); // Wait for animations

      // Full page screenshot
      await expect(page).toHaveScreenshot('homepage-mobile-320px.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });

    test('should match baseline at 375px (iPhone 8)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-mobile-375px.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });

    test('should match baseline at 414px (iPhone 11 Pro Max)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_LARGE);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-mobile-414px.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Tablet Viewports', () => {
    test('should match baseline at 768px (iPad)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.TABLET);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-tablet-768px.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('Desktop Viewports', () => {
    test('should match baseline at 1280px (Desktop)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-desktop-1280px.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    });

    test('should match baseline at 1920px (Large Desktop)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_LARGE);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-desktop-1920px.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    });
  });
});

test.describe('Visual Regression - Header Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should match mobile header at 320px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);
    await page.waitForTimeout(300);

    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('header-mobile-320px.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match mobile header with menu open at 375px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

    // Open mobile menu
    const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
    const hasHamburger = await hamburger.isVisible().catch(() => false);

    if (hasHamburger) {
      await hamburger.click();
      await page.waitForTimeout(500); // Wait for animation

      // Screenshot of open menu
      await expect(page).toHaveScreenshot('header-mobile-menu-open-375px.png', {
        maxDiffPixels: 100,
      });
    }
  });

  test('should match desktop header at 1280px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);
    await page.waitForTimeout(300);

    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('header-desktop-1280px.png', {
      maxDiffPixels: 50,
    });
  });
});

test.describe('Visual Regression - Footer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
  });

  test('should match mobile footer at 320px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const footer = page.locator('footer').first();
    await expect(footer).toHaveScreenshot('footer-mobile-320px.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match tablet footer at 768px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.TABLET);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const footer = page.locator('footer').first();
    await expect(footer).toHaveScreenshot('footer-tablet-768px.png', {
      maxDiffPixels: 75,
    });
  });

  test('should match desktop footer at 1280px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const footer = page.locator('footer').first();
    await expect(footer).toHaveScreenshot('footer-desktop-1280px.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should match dark mode mobile at 375px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

    // Toggle dark mode if available
    const themeToggle = page.locator('[aria-label*="theme" i], button[aria-label*="dark" i]').first();
    const hasToggle = await themeToggle.isVisible().catch(() => false);

    if (hasToggle) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-mobile-375px-dark.png', {
        fullPage: true,
        maxDiffPixels: 150,
      });
    }
  });

  test('should match dark mode desktop at 1280px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

    // Open mobile menu first if needed
    const hamburger = page.locator('[aria-label*="menu" i]').first();
    const hasHamburger = await hamburger.isVisible().catch(() => false);

    if (hasHamburger) {
      await hamburger.click();
      await page.waitForTimeout(300);
    }

    // Toggle dark mode
    const themeToggle = page.locator('[aria-label*="theme" i], button[aria-label*="dark" i]').first();
    const hasToggle = await themeToggle.isVisible().catch(() => false);

    if (hasToggle) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-desktop-1280px-dark.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    }
  });
});
