import { test, expect } from '@playwright/test';

/**
 * Regression: a null entry in the /api/github/filters `repositories` array must
 * not crash the client. Previously GithubEvents' `mobileRepoGroups` useMemo did
 * `repositories.map(repoName => repoName.split('/'))` with no guard, so a null
 * repo name threw "TypeError: Cannot read properties of null (reading 'split')"
 * and took down the whole page via the React error boundary.
 *
 * The /work page mounts <GithubEvents /> directly, so it is the tightest repro.
 */
test('GithubEvents tolerates a null repo from the filters API', async ({ page }) => {
  await page.route('**/api/github/filters', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        // The offending shape: a null slipped into the repo list.
        repositories: ['brian-stoker/v2.brianstoker.com', null],
        actionTypes: [],
        repositoryStats: [
          {
            name: 'brian-stoker/v2.brianstoker.com',
            count: 1,
            lastEventDate: '2026-01-01T00:00:00Z',
            recentTypes: ['PushEvent'],
          },
        ],
      }),
    });
  });

  // Keep the events feed deterministic; the crash is independent of it.
  await page.route('**/api/github/events**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ events: [], entries: [], totalCount: 0 }),
    });
  });

  const crashes: string[] = [];
  const isSplitCrash = (msg: string) =>
    /Cannot read properties of null \(reading 'split'\)/.test(msg);
  page.on('pageerror', (err) => {
    if (isSplitCrash(String(err))) crashes.push(String(err));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error' && isSplitCrash(msg.text())) crashes.push(msg.text());
  });

  await page.goto('/work', { waitUntil: 'networkidle' });
  // Give the filters fetch + useMemo a beat to run.
  await page.waitForTimeout(1500);

  expect(
    crashes,
    `client threw the null-repo split crash:\n${crashes.join('\n')}`,
  ).toHaveLength(0);
});
