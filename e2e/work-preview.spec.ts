import { test, expect } from '@playwright/test';

for (const width of [390, 1280]) {
  test.describe(`homepage Work preview at ${width}px`, () => {
    test.use({ viewport: { width, height: 1000 } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      // Work is the default homepage tab. Wait for real activity, not a loading shell.
      await expect(page.locator('#events-table-container > div').first()).toContainText(/\d{2}-\d{2}-\d{4}/, { timeout: 60000 });
    });

    test('repository strip filters in place and remains outside the preview link', async ({ page }) => {
      const timeline = page.locator('#events-table-container');
      const strip = timeline.locator('xpath=preceding-sibling::*[1]');
      const repo = strip.getByText('mono', { exact: true });
      await repo.click();
      await expect(page).toHaveURL(/\/(?:\?.*)?$/);
      await expect(timeline.getByText('stokd-cloud/mono', { exact: true }).first()).toBeVisible();
      await expect(strip.locator('a')).toHaveCount(0);
      await strip.getByText('All Repos', { exact: true }).click();
      await expect(page).toHaveURL(/\/(?:\?.*)?$/);
      await expect(timeline).toHaveAttribute('href', '/work');
    });

    test('cards, event labels, dates, background and keyboard all open /work', async ({ page }) => {
      const timeline = page.locator('#events-table-container');
      await expect(timeline).toHaveAttribute('href', '/work');
      await expect(timeline).toHaveAccessibleName('View all work activity');
      await expect(timeline.locator('a, button, [tabindex]')).toHaveCount(0);
      const targets = [
        () => timeline.locator('[id]').first().locator('> div').last(),
        () => timeline.locator('.MuiChip-label').first(),
        () => timeline.getByText(/^\d{2}-\d{2}-\d{4}$/).first(),
        () => timeline,
      ];
      for (const target of targets) {
        await target().click({ position: { x: 4, y: 4 } });
        await expect(page).toHaveURL(/\/work(?:\?.*)?$/);
        await page.goto('/');
        await expect(timeline.locator('[id]').first()).toBeVisible({ timeout: 60000 });
      }
      await timeline.focus();
      await expect(timeline).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/work(?:\?.*)?$/);
    });
  });
}

test('full /work preserves desktop event selection and external links', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/work');
  const timeline = page.locator('#events-table-container');
  await expect(timeline.locator('[id]').first()).toBeVisible({ timeout: 60000 });
  await expect(timeline).not.toHaveAttribute('href');
  const rows = timeline.locator('[id]');
  if (await rows.count() > 1) {
    await rows.nth(1).click();
    await expect(page).toHaveURL(/\/work\?.*event=/);
  }
  const external = page.locator('a[href^="https://github.com/"][target="_blank"]').first();
  await expect(external).toBeVisible({ timeout: 30000 });
  expect(await external.getAttribute('href')).toMatch(/^https:\/\/github.com\//);
});

test('full /work mobile timeline stays a non-link with working repo filters', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/work');
  const timeline = page.locator('#events-table-container');
  await expect(timeline.locator('[id]').first()).toBeVisible({ timeout: 60000 });
  await expect(timeline).not.toHaveAttribute('href');
  await timeline.locator('xpath=preceding-sibling::*[1]').getByText('mono', { exact: true }).click();
  await expect(timeline.getByText('stokd-cloud/mono', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveURL(/\/work(?:\?.*)?$/);
});
