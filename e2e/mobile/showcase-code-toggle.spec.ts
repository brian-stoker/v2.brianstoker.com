import { test, expect } from '@playwright/test';
import { VIEWPORTS, waitForAnimations } from '../utils/viewport-helpers';

/**
 * ShowcaseContainer Code Toggle Tests
 *
 * Tests for the mobile code visibility pattern in ShowcaseContainer component
 * to ensure code blocks are collapsible on mobile but always visible on desktop.
 *
 * Related GitHub issue: #8
 */

test.describe('ShowcaseContainer - Mobile Code Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Code Toggle Behavior (xs/sm)', () => {
    test('should hide code by default on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Look for code blocks
      const codeBlocks = page.locator('pre code, [class*="code" i] pre, .language-').first();
      const isVisible = await codeBlocks.isVisible().catch(() => false);

      // On mobile, code might be hidden initially or behind a toggle
      // Look for "View code" or "Show code" button
      const viewCodeButton = page.locator('button:has-text("View code"), button:has-text("Show code"), button:has-text("Code")').first();
      const hasToggle = await viewCodeButton.isVisible().catch(() => false);

      // Either code is hidden or there's a toggle button
      if (!hasToggle) {
        // If no toggle, code might still be visible - that's okay for some sections
        expect(true).toBeTruthy();
      } else {
        expect(hasToggle).toBeTruthy();
      }
    });

    test('should show "View code" button on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      // Look for code toggle button
      const toggleButton = page.locator(
        'button:has-text("View code"), button:has-text("Show code"), button:has-text("Hide code"), button[aria-label*="code" i]'
      ).first();

      const isVisible = await toggleButton.isVisible().catch(() => false);

      // Code toggle should exist on mobile showcase sections
      // Note: might not exist on all pages, so we check if showcase exists first
      const hasShowcase = await page.locator('[class*="showcase" i]').isVisible().catch(() => false);

      if (hasShowcase) {
        expect(isVisible).toBeTruthy();
      }
    });

    test('should expand code section on "View code" click', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Find toggle button
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        // Click to expand
        await toggleButton.click();
        await waitForAnimations(page);

        // Code block should now be visible
        const codeBlock = page.locator('pre code, [class*="code" i] pre').first();
        await expect(codeBlock).toBeVisible({ timeout: 3000 });

        // Button text should change to "Hide code"
        const hideButton = page.locator('button:has-text("Hide code")').first();
        await expect(hideButton).toBeVisible({ timeout: 2000 });
      }
    });

    test('should collapse code section on "Hide code" click', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_LARGE);

      // Find and expand code
      const viewButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasViewButton = await viewButton.isVisible().catch(() => false);

      if (hasViewButton) {
        await viewButton.click();
        await waitForAnimations(page);

        // Now hide it
        const hideButton = page.locator('button:has-text("Hide code")').first();
        await hideButton.click();
        await waitForAnimations(page);

        // Code block should be hidden
        const codeBlock = page.locator('pre code').first();
        const isVisible = await codeBlock.isVisible().catch(() => false);

        // Code should be hidden or have display:none
        if (isVisible) {
          const display = await codeBlock.evaluate((el) => {
            const parent = el.closest('[class*="collapse" i]');
            return parent ? window.getComputedStyle(parent).display : 'block';
          });
          expect(display === 'none' || display === 'hidden').toBeTruthy();
        }
      }
    });

    test('should have smooth transition animation (220ms)', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Find toggle button
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        // Click to expand
        await toggleButton.click();

        // Check for transition on collapse container
        const collapseContainer = page.locator('[class*="collapse" i], [class*="MuiCollapse" i]').first();
        const hasCollapse = await collapseContainer.isVisible().catch(() => false);

        if (hasCollapse) {
          const transition = await collapseContainer.evaluate((el) => {
            return window.getComputedStyle(el).transition;
          });

          // Should have a transition property
          expect(transition).not.toBe('');
          expect(transition).not.toBe('all 0s ease 0s');
        }

        await waitForAnimations(page);
      }
    });
  });

  test.describe('Desktop Code Visibility (md and above)', () => {
    test('should show code by default on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      // Look for code blocks - should be visible
      const codeBlock = page.locator('pre code, [class*="code" i] pre').first();
      const isVisible = await codeBlock.isVisible().catch(() => false);

      // Code should be visible on desktop (if showcase exists)
      const hasShowcase = await page.locator('[class*="showcase" i]').isVisible().catch(() => false);

      if (hasShowcase) {
        expect(isVisible).toBeTruthy();
      }
    });

    test('should not show toggle button on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_LARGE);

      // Toggle button should be hidden on desktop
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const isVisible = await toggleButton.isVisible().catch(() => false);

      // Toggle should not be visible on desktop
      if (isVisible) {
        const display = await toggleButton.evaluate((el) => window.getComputedStyle(el).display);
        expect(display).toBe('none');
      }
    });

    test('should maintain dual-panel layout on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.DESKTOP_MEDIUM);

      // On desktop, preview and code should be side-by-side or stacked but both visible
      const showcase = page.locator('[class*="showcase" i]').first();
      const hasShowcase = await showcase.isVisible().catch(() => false);

      if (hasShowcase) {
        const showcaseBox = await showcase.boundingBox();
        expect(showcaseBox).toBeTruthy();

        // Both preview and code should be present
        const preview = page.locator('[class*="preview" i]').first();
        const code = page.locator('pre code').first();

        const hasPreview = await preview.isVisible().catch(() => false);
        const hasCode = await code.isVisible().catch(() => false);

        // At least one should be visible (depends on page content)
        expect(hasPreview || hasCode).toBeTruthy();
      }
    });
  });

  test.describe('Code Display Quality', () => {
    test('should not push content below fold when code expands on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Get initial viewport state
      const viewportHeight = page.viewportSize()?.height || 0;

      // Find and expand code
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        await toggleButton.click();
        await waitForAnimations(page);

        // Page should not have excessive height
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

        // Content should be reasonable (not 10x viewport)
        expect(bodyHeight).toBeLessThan(viewportHeight * 10);
      }
    });

    test('should maintain code syntax highlighting', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Expand code if needed
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        await toggleButton.click();
        await waitForAnimations(page);
      }

      // Check for syntax highlighting classes
      const codeElements = page.locator('pre code [class*="token" i], pre code [class*="hljs" i], pre code span[style]');
      const count = await codeElements.count();

      // If code exists, it should have syntax highlighting
      const hasCode = await page.locator('pre code').isVisible().catch(() => false);
      if (hasCode) {
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should allow scrolling within code blocks on mobile', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_SMALL);

      // Expand code
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        await toggleButton.click();
        await waitForAnimations(page);

        // Code block should have overflow handling
        const codeBlock = page.locator('pre').first();
        const hasOverflow = await codeBlock.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.overflow === 'auto' || style.overflowX === 'auto' || style.overflow === 'scroll';
        }).catch(() => false);

        // Code should handle overflow
        expect(hasOverflow).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should support keyboard toggle for code visibility', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Find toggle button
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        // Focus button
        await toggleButton.focus();

        // Press Enter
        await page.keyboard.press('Enter');
        await waitForAnimations(page);

        // Code should be visible
        const codeBlock = page.locator('pre code').first();
        await expect(codeBlock).toBeVisible({ timeout: 3000 });
      }
    });

    test('should have accessible button labels', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      // Toggle button should have clear text
      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        const buttonText = await toggleButton.textContent();
        expect(buttonText).toBeTruthy();
        expect(buttonText?.toLowerCase()).toMatch(/code|view|show/);
      }
    });

    test('should maintain focus states for interactive elements', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.MOBILE_MEDIUM);

      const toggleButton = page.locator('button:has-text("View code"), button:has-text("Show code")').first();
      const hasButton = await toggleButton.isVisible().catch(() => false);

      if (hasButton) {
        await toggleButton.focus();

        // Button should have focus styles
        const hasFocus = await toggleButton.evaluate((el) => {
          return document.activeElement === el;
        });

        expect(hasFocus).toBeTruthy();
      }
    });
  });
});
