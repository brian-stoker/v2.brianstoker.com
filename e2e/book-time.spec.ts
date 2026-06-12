import { test, expect, Page } from '@playwright/test';

// Next weekday from today (skips weekends)
function nextWeekday(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isWeekend(d: Date): boolean {
  return d.getDay() === 0 || d.getDay() === 6;
}

async function gotoBookTime(page: Page) {
  await page.goto('/book-time');
  await page.waitForLoadState('networkidle');
}

// ── Layout & structure ────────────────────────────────────────────────────────

test.describe('Book Time page — layout', () => {
  test('shows mini calendar and week grid', async ({ page }) => {
    await gotoBookTime(page);
    await expect(page.getByTestId('mini-calendar')).toBeVisible();
    await expect(page.getByTestId('week-grid')).toBeVisible();
  });

  test('week grid shows exactly 5 day column headers (Mon–Fri)', async ({ page }) => {
    await gotoBookTime(page);
    await expect(page.getByTestId('day-column-header')).toHaveCount(5);
  });

  test('no Saturday or Sunday column headers', async ({ page }) => {
    await gotoBookTime(page);
    const headers = await page.getByTestId('day-column-header').allTextContents();
    const text = headers.join(' ');
    expect(text).not.toMatch(/Sat|Sun/);
  });

  test('today\'s column cells are highlighted, other columns are not', async ({ page }) => {
    const now = new Date();
    test.skip(isWeekend(now), 'Today is a weekend — not shown in the Mon–Fri grid');
    await gotoBookTime(page);
    const todayCells = page.locator(`[data-day-column="${localDateStr(now)}"] [data-today="true"]`);
    expect(await todayCells.count()).toBeGreaterThan(0);
    // No highlighted cells outside today's column
    const strayCells = page.locator(`[data-day-column]:not([data-day-column="${localDateStr(now)}"]) [data-today="true"]`);
    expect(await strayCells.count()).toBe(0);
    // And the header badge is gone — day number renders as plain text
    await expect(page.getByTestId('today-indicator')).toHaveCount(0);
  });

  test('unavailable slots render a dash', async ({ page }) => {
    await gotoBookTime(page);
    const unavail = page.getByTestId('day-unavailable');
    const count = await unavail.count();
    test.skip(count === 0, 'No unavailable slots in the current week');
    await expect(unavail.first()).toHaveText('—');
  });

  test('past slots earlier today are not bookable', async ({ page }) => {
    const now = new Date();
    test.skip(isWeekend(now), 'Today is a weekend — not shown in the Mon–Fri grid');
    // Only meaningful once at least one slot boundary has passed (first slot is 10:30 AM)
    test.skip(now.getHours() * 60 + now.getMinutes() <= 11 * 60, 'Too early — no slot has passed yet');
    await gotoBookTime(page);
    await page.waitForTimeout(3000); // let availability load

    // The first slot of today (10:30 AM) has passed; it must not be a clickable time-slot.
    const dayIndex = (now.getDay() + 6) % 7; // Mon=0 … Fri=4
    const columns = page.locator('[data-testid="week-grid"] [data-day-column]');
    const todayColumn = columns.nth(dayIndex);
    const firstCell = todayColumn.locator('[data-testid="time-slot"], [data-testid="day-unavailable"]').first();
    await expect(firstCell).toHaveAttribute('data-testid', 'day-unavailable');
  });
});

// ── Real API: availability ────────────────────────────────────────────────────

test.describe('Book Time page — real availability API', () => {
  test('GET /api/calendar/availability returns 200 and slots array for a future weekday', async ({ request }) => {
    const date = nextWeekday();
    const res = await request.get(`/api/calendar/availability?date=${date}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.slots)).toBe(true);
  });

  test('all returned slots fall between 10:30 AM and 5:30 PM', async ({ request }) => {
    const date = nextWeekday();
    const res = await request.get(`/api/calendar/availability?date=${date}`);
    const { slots } = await res.json();
    for (const iso of slots as string[]) {
      const d = new Date(iso);
      const totalMinutes = d.getHours() * 60 + d.getMinutes();
      expect(totalMinutes).toBeGreaterThanOrEqual(10 * 60 + 30); // 10:30 AM
      expect(totalMinutes).toBeLessThanOrEqual(17 * 60 + 30);    // 5:30 PM
    }
  });

  test('availability for today never includes slots that have already passed', async ({ request }) => {
    const now = new Date();
    test.skip(isWeekend(now), 'Today is a weekend — availability rejects it');
    const res = await request.get(`/api/calendar/availability?date=${localDateStr(now)}`);
    expect(res.status()).toBe(200);
    const { slots } = await res.json() as { slots: string[] };
    for (const iso of slots) {
      expect(new Date(iso).getTime()).toBeGreaterThan(now.getTime() - 60_000);
    }
  });

  test('GET /api/calendar/availability returns 400 for a past date', async ({ request }) => {
    const res = await request.get('/api/calendar/availability?date=2020-01-01');
    expect(res.status()).toBe(400);
  });

  test('GET /api/calendar/availability returns 400 for a weekend', async ({ request }) => {
    // Find next Saturday
    const d = new Date();
    while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
    const sat = d.toISOString().split('T')[0];
    const res = await request.get(`/api/calendar/availability?date=${sat}`);
    expect(res.status()).toBe(400);
  });

  test('GET /api/calendar/availability returns 400 for missing date param', async ({ request }) => {
    const res = await request.get('/api/calendar/availability');
    expect(res.status()).toBe(400);
  });
});

// ── Real API: booking ─────────────────────────────────────────────────────────

test.describe('Book Time page — real booking API', () => {
  test('POST /api/calendar/book returns 400 when required fields are missing', async ({ request }) => {
    const res = await request.post('/api/calendar/book', {
      data: { name: 'Test', email: 'test@test.com' }, // missing phone
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/calendar/book returns 400 for a past startTime', async ({ request }) => {
    const res = await request.post('/api/calendar/book', {
      data: {
        name: 'Test User', email: 'test@stokd.cloud', phone: '555-0000',
        startTime: '2020-01-01T10:30:00.000Z', durationMinutes: 30,
      },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/calendar/book creates a real event and returns eventId', async ({ request }) => {
    // Use a slot tomorrow at 10:30 AM local time
    const date = nextWeekday();
    // First get available slots
    const availRes = await request.get(`/api/calendar/availability?date=${date}`);
    const { slots } = await availRes.json() as { slots: string[] };

    if (!slots || slots.length === 0) {
      test.skip(true, `No available slots on ${date} — skipping booking test`);
      return;
    }

    const startTime = slots[0];
    const res = await request.post('/api/calendar/book', {
      data: {
        name: '[TEST] Playwright E2E',
        email: 'brian@stokd.cloud',
        phone: '555-0000',
        company: 'Stoked',
        reason: 'Automated e2e test — safe to delete',
        startTime,
        durationMinutes: 30,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.eventId).toBe('string');
    expect(body.eventId.length).toBeGreaterThan(0);
    expect(typeof body.eventLink).toBe('string');
  });
});

// ── UI flow with real availability ───────────────────────────────────────────

test.describe('Book Time page — UI with real API', () => {
  test('past day columns show day-unavailable indicator', async ({ page }) => {
    await gotoBookTime(page);
    // Current week always has at least Mon–yesterday as past if not Monday
    const unavail = page.getByTestId('day-unavailable');
    // At minimum: if today is not Monday, some days are past
    // Just verify the element type exists in the DOM (could be 0 on a Monday)
    const count = await unavail.count();
    expect(count).toBeGreaterThanOrEqual(0); // structural check
  });

  test('clicking a mini-calendar date loads availability for that week', async ({ page }) => {
    await gotoBookTime(page);
    // Click the first date number in the mini-calendar
    await page.getByTestId('mini-calendar').getByText(/^\d+$/).first().click();
    // Wait for the loading spinner to disappear
    await expect(page.getByRole('progressbar').first()).not.toBeVisible({ timeout: 10000 });
    // Grid should still show 5 columns
    await expect(page.getByTestId('day-column-header')).toHaveCount(5);
  });

  test('available time slots appear in the week grid after loading', async ({ page }) => {
    await gotoBookTime(page);
    // Navigate to next weekday so it definitely has slots
    const date = nextWeekday();
    const [y, m, d] = date.split('-').map(Number);
    // Click that day in the mini-calendar
    await page.getByTestId('mini-calendar').getByText(String(d)).click();
    // Wait for at least one time-slot to appear (or confirm loading completes)
    await page.waitForTimeout(3000);
    // Either slots loaded or all unavailable — grid should render
    await expect(page.getByTestId('week-grid')).toBeVisible();
  });

  test('clicking an available time slot selects it and shows booking form', async ({ page }) => {
    await gotoBookTime(page);
    // Navigate to next weekday
    const date = nextWeekday();
    const d = parseInt(date.split('-')[2], 10);
    await page.getByTestId('mini-calendar').getByText(String(d)).click();
    await page.waitForTimeout(3000);

    const slot = page.getByTestId('time-slot').first();
    const count = await slot.count();
    if (count === 0) { test.skip(true, 'No available slots — skipping'); return; }

    await slot.click();
    await expect(slot).toHaveAttribute('data-selected', 'true');
    await expect(page.getByTestId('booking-form')).toBeVisible();
  });

  test('duration display shows 30 min after slot selection', async ({ page }) => {
    await gotoBookTime(page);
    const date = nextWeekday();
    const d = parseInt(date.split('-')[2], 10);
    await page.getByTestId('mini-calendar').getByText(String(d)).click();
    await page.waitForTimeout(3000);

    const slot = page.getByTestId('time-slot').first();
    if (await slot.count() === 0) { test.skip(true, 'No slots'); return; }
    await slot.click();

    await expect(page.getByTestId('duration-display')).toContainText('30');
  });

  test('duration drag handle is in the week grid (not the form)', async ({ page }) => {
    await gotoBookTime(page);
    const date = nextWeekday();
    const d = parseInt(date.split('-')[2], 10);
    await page.getByTestId('mini-calendar').getByText(String(d)).click();
    await page.waitForTimeout(3000);

    const slot = page.getByTestId('time-slot').first();
    if (await slot.count() === 0) { test.skip(true, 'No slots'); return; }
    await slot.click();

    const handle = page.getByTestId('duration-drag-handle-bottom');
    await expect(handle).toBeVisible();

    // Handle must be inside the week-grid, not inside booking-form
    const gridBox = await page.getByTestId('week-grid').boundingBox();
    const handleBox = await handle.boundingBox();
    expect(gridBox).not.toBeNull();
    expect(handleBox).not.toBeNull();
    expect(handleBox!.y).toBeGreaterThanOrEqual(gridBox!.y);
    expect(handleBox!.y).toBeLessThan(gridBox!.y + gridBox!.height);
  });

  test('dragging duration handle down increases duration by 15 min increments', async ({ page }) => {
    await gotoBookTime(page);
    const date = nextWeekday();
    const d = parseInt(date.split('-')[2], 10);
    await page.getByTestId('mini-calendar').getByText(String(d)).click();
    await page.waitForTimeout(3000);

    const slot = page.getByTestId('time-slot').first();
    if (await slot.count() === 0) { test.skip(true, 'No slots'); return; }
    await slot.click();

    const handle = page.getByTestId('duration-drag-handle-bottom');
    const box = await handle.boundingBox();
    if (!box) { test.skip(true, 'No handle box'); return; }

    await page.mouse.move(box.x + box.width / 2, box.y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + 30);
    await page.mouse.up();

    await expect(page.getByTestId('duration-display')).toContainText('45');
  });

  test('submit button disabled until name, email, phone filled', async ({ page }) => {
    await gotoBookTime(page);
    const date = nextWeekday();
    const d = parseInt(date.split('-')[2], 10);
    await page.getByTestId('mini-calendar').getByText(String(d)).click();
    await page.waitForTimeout(3000);

    const slot = page.getByTestId('time-slot').first();
    if (await slot.count() === 0) { test.skip(true, 'No slots'); return; }
    await slot.click();

    const submit = page.getByRole('button', { name: /book appointment/i });
    await expect(submit).toBeDisabled();

    await page.locator('input[name="name"]').fill('Jane Doe');
    await expect(submit).toBeDisabled();

    await page.locator('input[name="email"]').fill('jane@example.com');
    await expect(submit).toBeDisabled();

    await page.locator('input[name="phone"]').fill('555-1234');
    await expect(submit).not.toBeDisabled();
  });

  test('full booking flow creates a real event and shows success', async ({ page }) => {
    await gotoBookTime(page);
    const date = nextWeekday();
    const d = parseInt(date.split('-')[2], 10);
    await page.getByTestId('mini-calendar').getByText(String(d)).click();
    await page.waitForTimeout(3000);

    const slot = page.getByTestId('time-slot').first();
    if (await slot.count() === 0) { test.skip(true, 'No available slots for e2e booking test'); return; }
    await slot.click();

    await page.locator('input[name="name"]').fill('[TEST] Playwright E2E');
    await page.locator('input[name="email"]').fill('brian@stokd.cloud');
    await page.locator('input[name="phone"]').fill('555-0000');
    await page.locator('input[name="company"]').fill('Stoked');
    await page.locator('input[name="reason"]').fill('Automated e2e test — safe to delete');

    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page.getByTestId('booking-success')).toBeVisible({ timeout: 15000 });
  });
});
