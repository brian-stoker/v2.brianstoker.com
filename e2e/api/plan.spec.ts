import { test, expect } from '@playwright/test';

test.setTimeout(120000);
test.describe.configure({ mode: 'serial' });

const image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==';
const headers = { Authorization: `Bearer ${process.env.PLAN_API_KEY}` };

test('rejects unauthenticated publishing and unsupported methods', async ({ request }) => {
  expect((await request.post('/api/plan', { data: { text: 'no' } })).status()).toBe(401);
  expect((await request.put('/api/plan')).status()).toBe(405);
  expect((await request.post('/api/plan', { headers: { Authorization: 'Bearer wrong' }, data: {} })).status()).toBe(401);
  expect((await request.get('/api/plan?page=0')).status()).toBe(400);
  expect((await request.get('/api/plan?author=hal&author=bstoked')).status()).toBe(400);
});

test('validates input before writing', async ({ request }) => {
  expect((await request.post('/api/plan', { headers, data: { author: '../hal', text: 'hi' } })).status()).toBe(400);
  expect((await request.post('/api/plan', { headers, data: { author: 'hal', text: '  ' } })).status()).toBe(400);
  expect((await request.post('/api/plan', { headers, data: { author: 'hal', text: 'hi', image: { contentType: 'image/png', base64: 'not an image' } } })).status()).toBe(400);
});

test('publishes text and image, filters authors, and reads a new author without a rebuild', async ({ request, page }) => {
  const author = `agent-${Date.now()}`;
  const title = `Local publishing check ${Date.now()}`;
  const response = await request.post('/api/plan', {
    headers,
    data: { author, title, text: 'First line\n\n<script>alert("unsafe")</script>', image: { contentType: 'image/png', base64: image, alt: 'Test pixel' } },
  });
  expect(response.status()).toBe(201);
  const { post } = await response.json();
  expect(response.headers().location).toBe(post.url);
  const uploaded = await request.get(post.image);
  expect(uploaded.status()).toBe(200);
  expect(uploaded.headers()['content-type']).toBe('image/png');
  expect((await uploaded.body()).toString('base64')).toBe(image);
  expect((await request.head(post.image)).status()).toBe(200);
  expect((await request.post(post.image)).status()).toBe(405);
  await page.goto(post.url);
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect(page.getByText('<script>alert("unsafe")</script>', { exact: false })).toBeVisible();
  await expect(page.getByAltText('Test pixel')).toBeVisible();
  await expect.poll(() => page.getByAltText('Test pixel').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
  await page.getByRole('link', { name: author, exact: true }).first().click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(`/.plan/${author}`);
  await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
  const all = await (await request.get('/api/plan')).json();
  const rss = await request.get('/feed/.plan/rss.xml');
  expect(rss.status()).toBe(200);
  expect(await rss.text()).toContain(title);
  expect(all.posts.some((item: { url: string }) => item.url === post.url)).toBeTruthy();
  expect(all.posts.every((item: Record<string, unknown>) => !('text' in item) && !('imageData' in item))).toBeTruthy();
  const secondPage = await (await request.get('/api/plan?page=2')).json();
  expect(secondPage.posts.length).toBeGreaterThan(0);
  expect(secondPage.posts.every((item: { id: string }) => !all.posts.some((first: { id: string }) => first.id === item.id))).toBeTruthy();
  const own = await (await request.get('/api/plan?author=bstoked')).json();
  expect(own.posts.every((item: { authors: string[] }) => item.authors.includes('bstoked'))).toBeTruthy();
  expect(own.posts.some((item: { url: string }) => item.url === post.url)).toBeFalsy();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/.plan');
  await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole('navigation', { name: 'Plan authors' }).getByRole('link', { name: 'hal', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'hal.plan', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 568 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test('preserves historical articles, author feeds, and redirects the old index', async ({ request, page }) => {
  const redirect = await request.get('/bstoked.plan', { maxRedirects: 0 });
  expect([307, 308]).toContain(redirect.status());
  expect(redirect.headers().location).toMatch(/^\/\.plan\/?$/);
  await page.goto('/.plan/hal');
  await expect(page.getByRole('heading', { name: 'hal.plan', exact: true })).toBeVisible();
  await page.goto('/.plan/bstoked');
  await expect(page.getByRole('heading', { name: 'bstoked.plan', exact: true })).toBeVisible();
  expect((await request.get('/.plan/2026-09-08-hal-wired-the-morning-plan')).status()).toBe(200);
  expect((await request.get('/.plan/no-such-author')).status()).toBe(404);
  expect((await request.get('/.plan/..%2Fhome%2F2025-02-21-launched-bstoked-plan')).status()).not.toBe(200);
  expect((await request.get('/.plan/hal/not-an-id')).status()).toBe(404);
});

test('publishes text alone and normalizes Brian attribution', async ({ request }) => {
  const response = await request.post('/api/plan', { headers, data: { author: 'brianstoker', text: 'A text-only entry' } });
  expect(response.status()).toBe(201);
  const { post } = await response.json();
  expect(post.authors).toEqual(['bstoked']);
  expect(post.title).toBe('A text-only entry');
  expect(post.image).toBeNull();
  expect((await request.get(post.url)).status()).toBe(200);
  expect((await request.get(post.url.replace('/bstoked/', '/hal/'))).status()).toBe(404);
});
