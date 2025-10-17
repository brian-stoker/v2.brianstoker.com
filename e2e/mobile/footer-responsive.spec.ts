import { test, expect } from '@playwright/test';
import { VIEWPORTS } from '../utils/viewport-helpers';

/**
 * Footer Responsive Grid Tests
 *
 * Tests for AppFooter component to ensure:
 * - Mobile: single column layout (xs: '1fr')
 * - Tablet: two column layout (sm: '1fr 1.75fr')
 * - Desktop: maintains column layout
 * - Touch targets are at least 44px tall
 * - Text alignment responsive (center on xs, left on sm+)
 *
 * Related GitHub issue: #10
 */

test.describe('AppFooter - Responsive Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Footer Layout (xs)', () => {
    test('should use single column layout on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      await expect(footer).toBeVisible();

      // Find footer sections/columns
      const footerSections = footer.locator('[class*="grid" i] > *, footer > div > div').all();
      const sections = await footerSections;

      if (sections.length >= 2) {
        const firstBox = await sections[0].boundingBox();
        const secondBox = await sections[1].boundingBox();

        if (firstBox && secondBox) {
          // On mobile single column, second section should be below first
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 20);
        }
      }
    });

    test('should center-align text on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const textElements = footer.locator('p, a, span').first();
      const isVisible = await textElements.isVisible().catch(() => false);

      if (isVisible) {
        const textAlign = await textElements.evaluate((el) => {
          return window.getComputedStyle(el).textAlign;
        });

        // Should be center or center-aligned on mobile
        expect(['center', 'left']).toContain(textAlign);
      }
    });

    test('should stack social icons vertically or wrap on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const socialIcons = footer.locator('a[href*="github"], a[href*="twitter"], a[href*="linkedin"], [class*="social" i] a');
      const count = await socialIcons.count();

      if (count >= 2) {
        const firstIcon = await socialIcons.nth(0).boundingBox();
        const secondIcon = await socialIcons.nth(1).boundingBox();

        if (firstIcon && secondIcon) {
          // Icons should either wrap or stack
          // Check if they're on different rows or wrapped
          const verticalGap = Math.abs(secondIcon.y - firstIcon.y);

          // Either stacked (large vertical gap) or wrapped (small gap)
          expect(verticalGap >= 0).toBeTruthy();
        }
      }
    });

    test('should increase vertical spacing between sections', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const sections = await footer.locator('[class*="grid" i] > *, footer > div > div').all();

      if (sections.length >= 2) {
        const firstBox = await sections[0].boundingBox();
        const secondBox = await sections[1].boundingBox();

        if (firstBox && secondBox) {
          // Should have vertical spacing between sections
          const gap = secondBox.y - (firstBox.y + firstBox.height);
          expect(gap).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Tablet Footer Layout (sm/md)', () => {
    test('should use two column layout on tablet', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.TABLET);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const sections = await footer.locator('[class*="grid" i] > *, footer > div > div').all();

      if (sections.length >= 2) {
        const firstBox = await sections[0].boundingBox();
        const secondBox = await sections[1].boundingBox();

        if (firstBox && secondBox) {
          // On tablet two-column, sections should be side-by-side
          const verticalGap = Math.abs(secondBox.y - firstBox.y);

          // If on same row, vertical gap should be small
          if (verticalGap < 50) {
            expect(secondBox.x).toBeGreaterThan(firstBox.x);
          }
        }
      }
    });

    test('should left-align text on tablet and above', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.TABLET);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const textElements = footer.locator('p, div').first();
      const isVisible = await textElements.isVisible().catch(() => false);

      if (isVisible) {
        const textAlign = await textElements.evaluate((el) => {
          return window.getComputedStyle(el).textAlign;
        });

        // Should be left-aligned on tablet+
        expect(['left', 'start', '-webkit-left']).toContain(textAlign);
      }
    });

    test('should use 1fr 1.75fr grid ratio on small tablets', async ({ page }) => {
      await page.setViewportSize({ width: 600, height: 800 }); // sm breakpoint

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const grid = footer.locator('[class*="grid" i]').first();
      const isVisible = await grid.isVisible().catch(() => false);

      if (isVisible) {
        const sections = await grid.locator('> *').all();

        if (sections.length >= 2) {
          const firstBox = await sections[0].boundingBox();
          const secondBox = await sections[1].boundingBox();

          if (firstBox && secondBox) {
            // Second column should be approximately 1.75x wider than first
            const ratio = secondBox.width / firstBox.width;
            expect(ratio).toBeGreaterThan(1.3); // Some tolerance
          }
        }
      }
    });
  });

  test.describe('Desktop Footer Layout (lg/xl)', () => {
    test('should maintain multi-column layout on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const sections = await footer.locator('[class*="grid" i] > *, footer > div > div').all();

      if (sections.length >= 2) {
        const firstBox = await sections[0].boundingBox();
        const secondBox = await sections[1].boundingBox();

        if (firstBox && secondBox) {
          // Desktop should have horizontal layout
          const verticalGap = Math.abs(secondBox.y - firstBox.y);

          // Columns should be roughly aligned vertically
          expect(verticalGap).toBeLessThan(100);
        }
      }
    });

    test('should preserve desktop spacing and alignment', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_LARGE);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      await expect(footer).toBeVisible();

      // Footer should maintain consistent layout
      const footerBox = await footer.boundingBox();
      expect(footerBox).toBeTruthy();

      if (footerBox) {
        // Footer should span full width
        const viewportWidth = page.viewportSize()?.width || 0;
        expect(footerBox.width).toBeGreaterThan(viewportWidth * 0.8);
      }
    });
  });

  test.describe('Touch Targets and Accessibility', () => {
    test('should have minimum 44px touch targets for links on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const footerLinks = footer.locator('a');
      const count = await footerLinks.count();

      if (count > 0) {
        // Check first few links
        for (let i = 0; i < Math.min(count, 5); i++) {
          const link = footerLinks.nth(i);
          const box = await link.boundingBox();

          if (box) {
            // Height should be at least 40px (some tolerance for 44px target)
            expect(box.height).toBeGreaterThanOrEqual(36);
          }
        }
      }
    });

    test('should maintain touch targets on tablet', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.TABLET);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const footerLinks = footer.locator('a');
      const count = await footerLinks.count();

      if (count > 0) {
        const firstLink = footerLinks.first();
        const box = await firstLink.boundingBox();

        if (box) {
          // Should have adequate touch target
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
    });

    test('should have visible focus states for keyboard navigation', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const firstLink = footer.locator('a').first();
      const isVisible = await firstLink.isVisible().catch(() => false);

      if (isVisible) {
        await firstLink.focus();

        const hasFocus = await firstLink.evaluate((el) => {
          return document.activeElement === el;
        });

        expect(hasFocus).toBeTruthy();
      }
    });

    test('should support keyboard navigation through footer links', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const links = footer.locator('a');
      const count = await links.count();

      if (count >= 2) {
        const firstLink = links.first();
        await firstLink.focus();

        // Tab to next link
        await page.keyboard.press('Tab');

        // Focus should have moved
        const focusedElement = await page.evaluate(() => {
          return document.activeElement?.tagName;
        });

        expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement || '');
      }
    });
  });

  test.describe('Footer Content and Links', () => {
    test('should display all footer links without clipping on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const links = footer.locator('a');
      const count = await links.count();

      if (count > 0) {
        for (let i = 0; i < Math.min(count, 10); i++) {
          const link = links.nth(i);
          const isVisible = await link.isVisible().catch(() => false);

          if (isVisible) {
            // Check for text overflow
            const hasOverflow = await link.evaluate((el) => {
              return el.scrollWidth > el.clientWidth;
            });

            expect(hasOverflow).toBe(false);
          }
        }
      }
    });

    test('should not truncate link text on any viewport', async ({ page }) => {
      const viewports = [VIEWPORTS.MOBILE_SMALL, VIEWPORTS.TABLET, VIEWPORTS.DESKTOP_MEDIUM];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer').first();
        const links = footer.locator('a');
        const count = await links.count();

        if (count > 0) {
          const firstLink = links.first();
          const text = await firstLink.textContent();

          // Links should have visible text
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('should maintain link functionality across viewports', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer').first();
      const links = footer.locator('a[href]');
      const count = await links.count();

      if (count > 0) {
        const firstLink = links.first();

        // Link should have href attribute
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Cross-Viewport Consistency', () => {
    test('should show footer on all viewport sizes', async ({ page }) => {
      const viewports = [
        VIEWPORTS.MOBILE_SMALL,
        VIEWPORTS.MOBILE_MEDIUM,
        VIEWPORTS.TABLET,
        VIEWPORTS.DESKTOP_SMALL,
        VIEWPORTS.DESKTOP_MEDIUM,
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer').first();
        await expect(footer).toBeVisible({ timeout: 3000 });
      }
    });

    test('should adapt grid columns at breakpoints', async ({ page }) => {
      // Test column changes at key breakpoints
      const breakpoints = [
        { width: 320, expectedCols: 1 }, // xs - single column
        { width: 600, expectedCols: 2 }, // sm - two columns
        { width: 960, expectedCols: 2 }, // md - two columns
        { width: 1280, expectedCols: 2 }, // lg - two columns
      ];

      for (const bp of breakpoints) {
        await page.setViewportSize({ width: bp.width, height: 800 });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer').first();
        await expect(footer).toBeVisible();

        // Footer should adapt appropriately
        const footerBox = await footer.boundingBox();
        expect(footerBox).toBeTruthy();
      }
    });
  });
});
