import { Page } from '@playwright/test';

/**
 * Common viewport sizes for mobile UX testing
 * Based on the mobile breakpoints defined in the issues
 */
export const VIEWPORTS = {
  // Mobile viewports
  MOBILE_SMALL: { width: 320, height: 568 }, // iPhone SE
  MOBILE_MEDIUM: { width: 375, height: 667 }, // iPhone 8
  MOBILE_LARGE: { width: 414, height: 896 }, // iPhone 11 Pro Max
  MOBILE_XL: { width: 430, height: 932 }, // iPhone 14 Pro Max

  // Tablet viewports
  TABLET: { width: 768, height: 1024 }, // iPad
  TABLET_LANDSCAPE: { width: 1024, height: 768 }, // iPad Landscape

  // Desktop viewports
  DESKTOP_SMALL: { width: 960, height: 720 }, // MUI 'md' breakpoint
  DESKTOP_MEDIUM: { width: 1280, height: 720 }, // MUI 'lg' breakpoint
  DESKTOP_LARGE: { width: 1920, height: 1080 }, // MUI 'xl' breakpoint
} as const;

/**
 * MUI breakpoints for reference
 */
export const MUI_BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

/**
 * Check if viewport is mobile (below 'md' breakpoint)
 */
export function isMobileViewport(width: number): boolean {
  return width < MUI_BREAKPOINTS.md;
}

/**
 * Check if viewport is tablet (between 'sm' and 'md')
 */
export function isTabletViewport(width: number): boolean {
  return width >= MUI_BREAKPOINTS.sm && width < MUI_BREAKPOINTS.md;
}

/**
 * Check if viewport is desktop (above 'md' breakpoint)
 */
export function isDesktopViewport(width: number): boolean {
  return width >= MUI_BREAKPOINTS.md;
}

/**
 * Wait for all animations to complete
 */
export async function waitForAnimations(page: Page, selector?: string): Promise<void> {
  if (selector) {
    await page.waitForSelector(selector, { state: 'visible' });
  }
  // Wait for CSS transitions (MUI uses 220ms for collapse)
  await page.waitForTimeout(300);
}

/**
 * Check if element is visible in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
}

/**
 * Get computed style of an element
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string,
): Promise<string> {
  return page.locator(selector).evaluate(
    (element, prop) => window.getComputedStyle(element).getPropertyValue(prop),
    property,
  );
}

/**
 * Check if element has horizontal scroll
 */
export async function hasHorizontalScroll(page: Page, selector?: string): Promise<boolean> {
  const target = selector || 'body';
  return page.locator(target).evaluate((element) => {
    return element.scrollWidth > element.clientWidth;
  });
}

/**
 * Simulate touch swipe gesture
 */
export async function swipe(
  page: Page,
  selector: string,
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 200,
): Promise<void> {
  const element = page.locator(selector);
  const box = await element.boundingBox();

  if (!box) {
    throw new Error(`Element ${selector} not found or not visible`);
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  let endX = startX;
  let endY = startY;

  switch (direction) {
    case 'left':
      endX = startX - distance;
      break;
    case 'right':
      endX = startX + distance;
      break;
    case 'up':
      endY = startY - distance;
      break;
    case 'down':
      endY = startY + distance;
      break;
  }

  await page.touchscreen.tap(startX, startY);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.mouse.up();
}
