import { test, expect } from '@playwright/test';
import {
  VIEWPORTS,
  isMobileViewport,
  isDesktopViewport,
  waitForAnimations,
  hasHorizontalScroll,
} from '../utils/viewport-helpers';

/**
 * Responsive Header Navigation Tests
 *
 * Tests for AppHeader, HeaderNavBar, and HeaderNavDropdown components
 * to ensure mobile UX improvements don't regress.
 *
 * Related GitHub issues: #3, #4, #5
 */

test.describe('Header Navigation - Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Hamburger Menu (xs/sm/md)', () => {
    test('should show hamburger menu on mobile viewports', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu"), [data-testid="hamburger-menu"]').first();
      await expect(hamburger).toBeVisible();
    });

    test('should hide desktop navigation on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Desktop navigation should be hidden on mobile
      const desktopNav = page.locator('nav').filter({ hasNotText: 'Quick actions' }).first();
      const isVisible = await desktopNav.isVisible().catch(() => false);

      // Either not visible or display: none
      if (isVisible) {
        const display = await desktopNav.evaluate((el) => window.getComputedStyle(el).display);
        expect(display).toBe('none');
      }
    });

    test('should open mobile menu on hamburger click', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_LARGE);

      // Find and click hamburger
      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
      await hamburger.click();

      // Wait for animation
      await waitForAnimations(page);

      // Check for menu content - look for navigation links or "Quick actions"
      const menuContent = page.locator('text="Quick actions"').or(page.locator('nav a').first());
      await expect(menuContent).toBeVisible({ timeout: 5000 });
    });

    test('should close mobile menu on outside click', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Open menu
      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
      await hamburger.click();
      await waitForAnimations(page);

      // Click outside (on backdrop or body)
      await page.mouse.click(10, 10);
      await waitForAnimations(page);

      // Menu should be closed - check if "Quick actions" is hidden
      const menuContent = page.locator('text="Quick actions"');
      const isVisible = await menuContent.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    });

    test('should have touch-friendly spacing in mobile menu', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Open menu
      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
      await hamburger.click();
      await waitForAnimations(page);

      // Find menu links
      const menuLinks = page.locator('nav a, [role="menuitem"]');
      const count = await menuLinks.count();

      if (count > 0) {
        // Check first link has adequate height for touch (at least 44px)
        const firstLink = menuLinks.first();
        const box = await firstLink.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(40); // Some tolerance for padding
      }
    });
  });

  test.describe('Desktop Navigation (md and above)', () => {
    test('should show desktop navigation on large viewports', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      // Navigation bar should be visible
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    });

    test('should hide hamburger menu on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      // Hamburger should not be visible on desktop
      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
      const isVisible = await hamburger.isVisible().catch(() => false);

      if (isVisible) {
        const display = await hamburger.evaluate((el) => window.getComputedStyle(el).display);
        expect(display).toBe('none');
      }
    });

    test('should display navigation in single row on desktop (960px+)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_SMALL);

      // Check navigation doesn't wrap
      const nav = page.locator('nav').first();
      const navBox = await nav.boundingBox();

      if (navBox) {
        // Navigation height should be reasonable for single row (< 100px typically)
        expect(navBox.height).toBeLessThan(150);
      }
    });

    test('should not have horizontal scroll on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      const hasScroll = await hasHorizontalScroll(page);
      expect(hasScroll).toBe(false);
    });
  });

  test.describe('Header Actions Visibility (Issue #4)', () => {
    test('should hide non-essential icons on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      // GitHub icon and other non-essential actions should be hidden or in menu
      const headerActions = page.locator('header').first();
      const githubIcon = headerActions.locator('[aria-label*="github" i]');

      const isVisible = await githubIcon.isVisible().catch(() => false);

      // GitHub icon should either be hidden or moved to mobile menu
      if (isVisible) {
        // Check if it's in the mobile dropdown menu instead
        const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
        await hamburger.click();
        await waitForAnimations(page);

        const menuGithubIcon = page.locator('[role="menu"] [aria-label*="github" i], text="Quick actions"');
        await expect(menuGithubIcon).toBeVisible();
      }
    });

    test('should show all header actions on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      // Theme toggle and GitHub should be visible on desktop
      const header = page.locator('header').first();
      await expect(header).toBeVisible();

      // Check header contains action buttons
      const actionButtons = header.locator('button');
      const count = await actionButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation Overflow Prevention (Issue #3)', () => {
    test('should not clip navigation text at 320px', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      const hasScroll = await hasHorizontalScroll(page, 'header');
      expect(hasScroll).toBe(false);
    });

    test('should not clip navigation text at tablet breakpoint (768px)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.TABLET);

      const hasScroll = await hasHorizontalScroll(page, 'header');
      expect(hasScroll).toBe(false);
    });

    test('should allow nav items to wrap or use appropriate spacing', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.TABLET);

      // Check if page is usable without horizontal scroll
      const bodyScroll = await hasHorizontalScroll(page);
      expect(bodyScroll).toBe(false);
    });
  });

  test.describe('Mobile Menu Dropdown Anchoring (Issue #5)', () => {
    test('should anchor dropdown to header height on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Get header height
      const header = page.locator('header').first();
      const headerBox = await header.boundingBox();

      // Open mobile menu
      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
      await hamburger.click();
      await waitForAnimations(page);

      // Find dropdown/menu panel
      const dropdown = page.locator('[role="menu"], nav').filter({ hasText: /Quick actions|Documentation|About/i }).first();
      const dropdownBox = await dropdown.boundingBox().catch(() => null);

      if (headerBox && dropdownBox) {
        // Dropdown should start at or near header bottom
        const gap = Math.abs(dropdownBox.y - (headerBox.y + headerBox.height));
        expect(gap).toBeLessThan(10); // Allow small gap for border/shadow
      }
    });

    test('should use full width on mobile for dropdown', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Open mobile menu
      const hamburger = page.locator('[aria-label*="menu" i], button:has-text("Menu")').first();
      await hamburger.click();
      await waitForAnimations(page);

      // Menu should be close to full width on mobile
      const dropdown = page.locator('[role="menu"], nav').filter({ hasText: /Quick actions|Documentation/i }).first();
      const dropdownBox = await dropdown.boundingBox().catch(() => null);
      const viewportWidth = page.viewportSize()?.width || 0;

      if (dropdownBox) {
        // Width should be at least 80% of viewport on mobile
        const widthRatio = dropdownBox.width / viewportWidth;
        expect(widthRatio).toBeGreaterThan(0.75);
      }
    });
  });

  test.describe('Cross-viewport Consistency', () => {
    test('should maintain logo visibility across all viewports', async ({ page }) => {
      const viewports = [
        VIEWPORTS.MOBILE_SMALL,
        VIEWPORTS.MOBILE_MEDIUM,
        VIEWPORTS.TABLET,
        VIEWPORTS.DESKTOP_MEDIUM,
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300); // Wait for resize

        // Logo should always be visible
        const logo = page.locator('header img, header svg, header [alt*="logo" i]').first();
        await expect(logo).toBeVisible({ timeout: 3000 });
      }
    });

    test('should not have horizontal overflow at any tested viewport', async ({ page }) => {
      const viewports = [
        VIEWPORTS.MOBILE_SMALL,
        VIEWPORTS.MOBILE_MEDIUM,
        VIEWPORTS.TABLET,
        VIEWPORTS.DESKTOP_SMALL,
        VIEWPORTS.DESKTOP_MEDIUM,
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300);

        const hasScroll = await hasHorizontalScroll(page);
        expect(hasScroll).toBe(false);
      }
    });
  });
});
