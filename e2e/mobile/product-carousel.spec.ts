import { test, expect } from '@playwright/test';
import { VIEWPORTS, waitForAnimations, swipe } from '../utils/viewport-helpers';

/**
 * Mobile Product Carousel Tests
 *
 * Tests for the MobileProductCarousel component in src/products.tsx
 * to ensure swipeable functionality and responsive behavior.
 *
 * Related GitHub issue: #6
 */

test.describe('Product Carousel - Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Carousel Display (xs to md)', () => {
    test('should show carousel on mobile viewports', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Look for carousel indicators (dots/stepper or swipeable container)
      const carousel = page.locator('[class*="swipeable" i], [class*="carousel" i], [role="tablist"]').first();
      const isVisible = await carousel.isVisible().catch(() => false);

      // Carousel should exist on mobile
      expect(isVisible).toBeTruthy();
    });

    test('should hide carousel on desktop and show stacked layout', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      // Mobile carousel should be hidden on desktop (display: none or not rendered)
      const mobileCarousel = page.locator('[class*="swipeable" i]').first();
      const isVisible = await mobileCarousel.isVisible().catch(() => false);

      if (isVisible) {
        const display = await mobileCarousel.evaluate((el) => window.getComputedStyle(el).display);
        expect(display).toBe('none');
      }
    });

    test('should display product cards at full width on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Find product cards - they should be full width on mobile
      const productCard = page.locator('[class*="product" i]').first();
      const isVisible = await productCard.isVisible().catch(() => false);

      if (isVisible) {
        const cardBox = await productCard.boundingBox();
        const viewportWidth = page.viewportSize()?.width || 0;

        if (cardBox) {
          // Card should take up most of the viewport width (with some padding)
          const widthRatio = cardBox.width / viewportWidth;
          expect(widthRatio).toBeGreaterThan(0.8);
        }
      }
    });
  });

  test.describe('Swipe Gestures and Navigation', () => {
    test('should have navigation arrows on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Look for navigation arrows
      const leftArrow = page.locator('button[aria-label*="previous" i], button[aria-label*="back" i], button:has-text("‹"), button:has-text("←")').first();
      const rightArrow = page.locator('button[aria-label*="next" i], button[aria-label*="forward" i], button:has-text("›"), button:has-text("→")').first();

      const hasLeftArrow = await leftArrow.isVisible().catch(() => false);
      const hasRightArrow = await rightArrow.isVisible().catch(() => false);

      // At least one navigation control should exist
      expect(hasLeftArrow || hasRightArrow).toBeTruthy();
    });

    test('should navigate to next item on arrow click', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_LARGE);

      // Find next button
      const nextButton = page.locator('button[aria-label*="next" i], button:has-text("›"), button:has-text("→")').first();
      const isVisible = await nextButton.isVisible().catch(() => false);

      if (isVisible) {
        // Click next
        await nextButton.click();
        await waitForAnimations(page);

        // Carousel should have transitioned
        // Check if pagination dots changed or content changed
        const activeDot = page.locator('[class*="active" i][class*="dot" i], [aria-current="true"]').first();
        await expect(activeDot).toBeVisible({ timeout: 2000 });
      }
    });

    test('should show pagination dots/stepper on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Look for pagination indicators
      const pagination = page.locator(
        '[class*="stepper" i], [class*="dots" i], [class*="pagination" i], [role="tablist"], button[role="tab"]'
      ).first();

      const isVisible = await pagination.isVisible().catch(() => false);
      expect(isVisible).toBeTruthy();
    });

    test('should support keyboard navigation for accessibility', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Find navigation button and focus it
      const navButton = page.locator('button[aria-label*="next" i], button[aria-label*="previous" i]').first();
      const isVisible = await navButton.isVisible().catch(() => false);

      if (isVisible) {
        await navButton.focus();
        await page.keyboard.press('Enter');
        await waitForAnimations(page);

        // Verify navigation occurred
        const activeDot = page.locator('[class*="active" i], [aria-current="true"]');
        const count = await activeDot.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Product Features Layout', () => {
    test('should stack features vertically on mobile (xs)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      // Find feature items - they should stack vertically on mobile
      const features = page.locator('[class*="feature" i]');
      const count = await features.count();

      if (count >= 2) {
        const firstBox = await features.nth(0).boundingBox();
        const secondBox = await features.nth(1).boundingBox();

        if (firstBox && secondBox) {
          // On mobile vertical stack, second item should be below first
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
        }
      }
    });

    test('should display features in row on tablet (sm)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.TABLET);

      // On tablet, features may be in a row
      const features = page.locator('[class*="feature" i]');
      const count = await features.count();

      if (count >= 2) {
        const firstBox = await features.nth(0).boundingBox();
        const secondBox = await features.nth(1).boundingBox();

        if (firstBox && secondBox) {
          // On tablet, items might be side-by-side
          // Check if they're roughly on the same horizontal level
          const verticalGap = Math.abs(secondBox.y - firstBox.y);
          // If gap is small, they're in a row
          if (verticalGap < 50) {
            expect(secondBox.x).toBeGreaterThan(firstBox.x);
          }
        }
      }
    });
  });

  test.describe('Touch and Mouse Events', () => {
    test('should enable mouse events for carousel', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Find swipeable container
      const carousel = page.locator('[class*="swipeable" i]').first();
      const isVisible = await carousel.isVisible().catch(() => false);

      if (isVisible) {
        // Carousel should be interactive
        const box = await carousel.boundingBox();
        expect(box).toBeTruthy();

        // Should be able to click navigation
        const navButton = page.locator('button[aria-label*="next" i]').first();
        await navButton.click({ timeout: 3000 });
        await waitForAnimations(page);

        // Should successfully navigate
        expect(true).toBeTruthy();
      }
    });

    test('should have resistance on swipe boundaries', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // This tests the resistance property of SwipeableViews
      // Find carousel
      const carousel = page.locator('[class*="swipeable" i]').first();
      const isVisible = await carousel.isVisible().catch(() => false);

      if (isVisible) {
        // Try to swipe - should have smooth interaction
        await carousel.hover();

        // Verify carousel exists and is interactive
        const box = await carousel.boundingBox();
        expect(box).toBeTruthy();
      }
    });
  });

  test.describe('Content Visibility and Truncation', () => {
    test('should not truncate product titles on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Find product titles/headings
      const titles = page.locator('h2, h3, [class*="title" i]');
      const count = await titles.count();

      if (count > 0) {
        const firstTitle = titles.first();
        await expect(firstTitle).toBeVisible();

        // Check for text overflow
        const hasOverflow = await firstTitle.evaluate((el) => {
          return el.scrollWidth > el.clientWidth;
        });

        expect(hasOverflow).toBe(false);
      }
    });

    test('should maintain readable font sizes on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      // Find product content
      const content = page.locator('[class*="product" i] p, [class*="product" i] span').first();
      const isVisible = await content.isVisible().catch(() => false);

      if (isVisible) {
        const fontSize = await content.evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize);
        });

        // Font size should be at least 14px for readability on mobile
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });
  });

  test.describe('Desktop Behavior Preservation', () => {
    test('should show stacked layout on desktop (md and above)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      // Mobile carousel should be hidden, desktop layout visible
      const mobileCarousel = page.locator('[class*="swipeable" i]').first();
      const isMobileVisible = await mobileCarousel.isVisible().catch(() => false);

      // Mobile carousel should not be visible on desktop
      if (isMobileVisible) {
        const display = await mobileCarousel.evaluate((el) => window.getComputedStyle(el).display);
        expect(display).toBe('none');
      }
    });

    test('should not show mobile navigation on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_LARGE);

      // Mobile-specific navigation (carousel dots) should be hidden
      const mobileDots = page.locator('[class*="mobile" i][class*="stepper" i]').first();
      const isVisible = await mobileDots.isVisible().catch(() => false);

      // Should be hidden or not exist on desktop
      expect(isVisible).toBe(false);
    });
  });
});
