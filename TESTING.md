# Mobile UX Testing Strategy

This document outlines the comprehensive testing strategy implemented to prevent regressions in the mobile user experience improvements made to this project.

## Overview

All mobile UX improvements from GitHub issues #3-#11 are now protected by automated E2E tests using Playwright. These tests run automatically on every pull request and push to main branches.

## Test Coverage

### 1. Responsive Header Navigation (`e2e/mobile/header-navigation.spec.ts`)

Tests for `AppHeader`, `HeaderNavBar`, and `HeaderNavDropdown` components:

- ✅ Mobile hamburger menu visibility and functionality
- ✅ Desktop navigation bar display
- ✅ Header action icons responsive hiding/showing
- ✅ Navigation overflow prevention at all breakpoints
- ✅ Mobile menu dropdown anchoring to header height
- ✅ Touch-friendly spacing in mobile menu
- ✅ Keyboard navigation support

**Related Issues:** #3, #4, #5

### 2. Mobile Product Carousel (`e2e/mobile/product-carousel.spec.ts`)

Tests for `MobileProductCarousel` component in `src/products.tsx`:

- ✅ Carousel visibility on mobile viewports
- ✅ Desktop stacked layout preservation
- ✅ Swipe gesture support
- ✅ Navigation arrows and pagination dots
- ✅ Product features responsive stacking (column on xs, row on sm)
- ✅ Full-width card display on mobile
- ✅ Keyboard accessibility
- ✅ Mouse event support

**Related Issue:** #6

### 3. ShowcaseContainer Code Toggle (`e2e/mobile/showcase-code-toggle.spec.ts`)

Tests for mobile code visibility pattern:

- ✅ Code hidden by default on mobile
- ✅ "View code" / "Hide code" toggle button
- ✅ Smooth collapse animation (220ms transition)
- ✅ Desktop code always visible
- ✅ No toggle button on desktop
- ✅ Code syntax highlighting preserved
- ✅ Scrollable code blocks

**Related Issue:** #8

### 4. Newsletter Toast Positioning (`e2e/mobile/newsletter-toast.spec.ts`)

Tests for `NewsletterToast` component positioning:

- ✅ Mobile: bottom-fixed position (bottom: 16px)
- ✅ Mobile: slides up from bottom
- ✅ Desktop: top position (top: 80px)
- ✅ Desktop: slides down from top
- ✅ Responsive padding (xs: minimal, sm+: standard)
- ✅ Toast dismissal functionality
- ✅ Auto-dismiss after timeout
- ✅ Safe area positioning on mobile

**Related Issue:** #9

### 5. Footer Responsive Grid (`e2e/mobile/footer-responsive.spec.ts`)

Tests for `AppFooter` responsive layout:

- ✅ Mobile: single column (xs: '1fr')
- ✅ Tablet: two columns (sm: '1fr 1.75fr')
- ✅ Desktop: preserved multi-column layout
- ✅ Text alignment: center on xs, left on sm+
- ✅ Touch targets minimum 44px height
- ✅ Social icons responsive wrapping
- ✅ Vertical spacing between sections
- ✅ No link text truncation

**Related Issue:** #10

### 6. Visual Regression Tests (`e2e/visual-regression.spec.ts`)

Screenshot-based tests to catch visual changes:

- ✅ Homepage at 320px, 375px, 414px, 768px, 1280px, 1920px
- ✅ Header component screenshots
- ✅ Footer component screenshots
- ✅ Mobile menu open state
- ✅ Dark mode screenshots
- ✅ Baseline comparison with configurable thresholds

### 7. Smoke Tests (`e2e/smoke-tests.spec.ts`)

Quick regression checks across all critical viewports:

- ✅ Page load without errors
- ✅ No horizontal scroll at any viewport
- ✅ Header visibility and functionality
- ✅ Navigation text clipping prevention
- ✅ Hero typography responsive sizing
- ✅ Product carousel navigation
- ✅ Code toggle functionality
- ✅ Toast positioning
- ✅ Footer link stacking
- ✅ Performance and accessibility checks

## Running Tests

### Local Development

```bash
# Run all tests
pnpm test

# Run in headed mode (see browser)
pnpm test:headed

# Run with UI mode (interactive)
pnpm test:ui

# Run smoke tests only
pnpm test:smoke

# Run mobile-specific tests
pnpm test:mobile

# Run visual regression tests
pnpm test:visual

# Update visual baselines
pnpm test:visual:update

# Debug tests
pnpm test:debug

# View test report
pnpm test:report
```

### Continuous Integration

Tests run automatically via GitHub Actions (`.github/workflows/mobile-ux-tests.yml`):

- **On PR:** Full test suite runs on all pull requests
- **On Push:** Tests run on main/master branches
- **Manual:** Can be triggered via workflow_dispatch

The CI workflow includes:
- Mobile UX tests (sharded across 2 workers)
- Smoke tests
- Visual regression tests
- Test result artifacts with 30-day retention
- Screenshot uploads on failures

## Test Configuration

### Playwright Config (`playwright.config.ts`)

The configuration defines 9 test projects covering critical viewports:

**Mobile:**
- iPhone SE (320px)
- iPhone 12 (390px)
- iPhone 14 Pro Max (430px)
- Mobile Safari

**Tablet:**
- iPad (768px)
- iPad Pro (1024px)

**Desktop:**
- Desktop Chrome (1280px)
- Desktop Chrome (1920px)
- Desktop Safari

### Viewport Sizes

Defined in `e2e/utils/viewport-helpers.ts`:

```typescript
MOBILE_SMALL: { width: 320, height: 568 }   // iPhone SE
MOBILE_MEDIUM: { width: 375, height: 667 }  // iPhone 8
MOBILE_LARGE: { width: 414, height: 896 }   // iPhone 11 Pro Max
TABLET: { width: 768, height: 1024 }        // iPad
DESKTOP_SMALL: { width: 960, height: 720 }  // MUI 'md'
DESKTOP_MEDIUM: { width: 1280, height: 720 } // MUI 'lg'
DESKTOP_LARGE: { width: 1920, height: 1080 } // MUI 'xl'
```

### MUI Breakpoints

```typescript
xs: 0px
sm: 600px
md: 960px
lg: 1280px
xl: 1920px
```

## Helper Utilities

`e2e/utils/viewport-helpers.ts` provides:

- **Viewport detection:** `isMobileViewport()`, `isTabletViewport()`, `isDesktopViewport()`
- **Animation helpers:** `waitForAnimations()`, `getComputedStyle()`
- **Viewport checks:** `isInViewport()`, `hasHorizontalScroll()`
- **Touch gestures:** `swipe()` for simulating swipe interactions

## Test Maintenance

### Updating Visual Baselines

When intentional visual changes are made:

```bash
pnpm test:visual:update
```

Commit the updated screenshots in the repository.

### Adding New Tests

1. Create a new `.spec.ts` file in `e2e/mobile/` or `e2e/`
2. Import helpers from `e2e/utils/viewport-helpers.ts`
3. Follow the existing test patterns
4. Run locally to verify
5. Tests will automatically run in CI

### Test Failure Handling

When tests fail in CI:

1. Check the test report artifact in GitHub Actions
2. Download failure screenshots from artifacts
3. Investigate the visual diff or error message
4. Fix the regression or update the baseline
5. Re-run tests

## Best Practices

1. **Mobile-First:** Always test mobile viewports first
2. **Desktop Parity:** Ensure desktop behavior is unchanged
3. **Real Devices:** Test on actual devices when possible
4. **Accessibility:** Include keyboard navigation and focus tests
5. **Performance:** Keep smoke tests fast (<10 minutes)
6. **Screenshots:** Use visual regression for layout changes
7. **Descriptive Names:** Test names should clearly describe what's being tested

## Coverage by GitHub Issue

| Issue | Component | Test File | Status |
|-------|-----------|-----------|--------|
| #3 | Nav overflow prevention | `header-navigation.spec.ts` | ✅ |
| #4 | Simplify header actions | `header-navigation.spec.ts` | ✅ |
| #5 | Fix hamburger dropdown | `header-navigation.spec.ts` | ✅ |
| #6 | Mobile product switcher | `product-carousel.spec.ts` | ✅ |
| #7 | Resize hero typography | `smoke-tests.spec.ts` | ✅ |
| #8 | Collapse showcase/code | `showcase-code-toggle.spec.ts` | ✅ |
| #9 | Reposition newsletter toast | `newsletter-toast.spec.ts` | ✅ |
| #10 | Make footer mobile-friendly | `footer-responsive.spec.ts` | ✅ |
| #11 | Mobile/desktop QA | All test files | ✅ |

## Manual QA Checklist

While automated tests cover most scenarios, manual QA should verify:

- [ ] Header menu drawer opens smoothly on mobile
- [ ] Navigation chips wrap cleanly at 320px
- [ ] Hero content displays above fold on 375px screens
- [ ] Product preview carousel swipes naturally on touch devices
- [ ] Showcase code toggle animation feels smooth
- [ ] Newsletter toast doesn't cover header on mobile
- [ ] Footer links have adequate touch targets (44px+)
- [ ] Header navigation displays in single row at ≥960px
- [ ] Desktop layout matches before/after screenshots
- [ ] Both light and dark themes work correctly

## Debugging Tips

### Test Not Finding Element

```typescript
// Add timeout and wait for selector
await page.waitForSelector('header', { state: 'visible', timeout: 5000 });
await expect(page.locator('header')).toBeVisible();
```

### Animation Issues

```typescript
import { waitForAnimations } from '../utils/viewport-helpers';

await element.click();
await waitForAnimations(page); // Waits 300ms for transitions
```

### Flaky Tests

```typescript
// Use retry logic for unstable elements
const element = page.locator('selector').first();
await expect(element).toBeVisible({ timeout: 5000 });
```

### Screenshots for Debugging

```typescript
// Take screenshot of specific element
await page.locator('header').screenshot({ path: 'debug-header.png' });

// Full page screenshot
await page.screenshot({ path: 'debug-fullpage.png', fullPage: true });
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [MUI Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [Mobile UX Guidelines](https://web.dev/mobile/)

## Contributing

When making changes to mobile UX:

1. Update or add tests to cover your changes
2. Run the full test suite locally
3. Update visual baselines if needed
4. Document any new test patterns
5. Ensure CI passes before merging

---

**Last Updated:** 2025-10-17
**Test Framework:** Playwright 1.56.1
**Total Test Files:** 7
**Total Test Cases:** 100+
**Viewports Tested:** 9
