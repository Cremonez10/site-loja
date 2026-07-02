import { test, expect } from '@playwright/test';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Performs a full admin sign-in via the UI and waits for redirect to /admin.
 */
async function adminSignIn(page: import('@playwright/test').Page) {
  await page.goto('/admin/signin');
  await page.fill('input[type="email"]', 'admin@jofogo.dev');
  await page.fill('input[type="password"]', 'Dev@2026!');
  await Promise.all([page.waitForNavigation(), page.click('button:has-text("Entrar")')]);
}

/**
 * Obtains a valid admin_session cookie value by signing in through the API.
 * Returns the raw cookie string for use in request headers.
 */
async function getAdminSessionCookie(
  request: import('@playwright/test').APIRequestContext,
): Promise<string> {
  const res = await request.post('/api/admin/auth/signin', {
    data: { email: 'admin@jofogo.dev', password: 'Dev@2026!' },
  });
  expect(res.status()).toBe(200);
  const setCookie = res.headers()['set-cookie'] ?? '';
  // Extract the admin_session value from Set-Cookie header
  const match = setCookie.match(/admin_session=([^;]+)/);
  expect(match, 'admin_session cookie must be present after sign-in').toBeTruthy();
  return `admin_session=${match![1]}`;
}

// ── Test suite ─────────────────────────────────────────────────────────────

test.describe('admin interests', () => {
  // ── Auth protection ──────────────────────────────────────────────────────

  test('unauthenticated GET /api/admin/interests returns 401', async ({ request }) => {
    const res = await request.get('/api/admin/interests');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  test('unauthenticated user is redirected from /admin/interests to signin', async ({ page }) => {
    await page.goto('/admin/interests');
    expect(page.url()).toContain('/admin/signin');
  });

  // ── Authenticated access ─────────────────────────────────────────────────

  test('authenticated GET /api/admin/interests returns 200 with drafts array', async ({ request }) => {
    const cookie = await getAdminSessionCookie(request);
    const res = await request.get('/api/admin/interests', {
      headers: { cookie },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('drafts');
    expect(Array.isArray(body.drafts)).toBe(true);
  });

  test('authenticated admin can access /admin/interests page', async ({ page }) => {
    await adminSignIn(page);
    await page.goto('/admin/interests');

    // Heading must be visible
    await expect(page.locator('#admin-interests-heading')).toBeVisible();
    await expect(page.locator('#admin-interests-heading')).toContainText('Interesses registrados');

    // Either empty state or table must be present (not both)
    const hasTable = await page.locator('#admin-interests-table').count();
    const hasEmpty = await page.locator('#admin-interests-empty').count();
    expect(hasTable + hasEmpty, 'Either table or empty state must render').toBeGreaterThan(0);
  });

  test('admin interests page does not contain public forbidden terms', async ({ page }) => {
    await adminSignIn(page);
    await page.goto('/admin/interests');

    // Wait for content to load (heading is always present)
    await expect(page.locator('#admin-interests-heading')).toBeVisible();

    const bodyText = await page.locator('body').innerText();
    const normalised = bodyText.toLowerCase();

    const prohibited = [
      'comprar',
      'carrinho',
      'checkout',
      'pagamento',
      'frete',
      'whatsapp',
      'finalizar pedido',
      'pedido final',
    ];
    for (const term of prohibited) {
      expect(normalised, `Admin interests page must not contain forbidden term: "${term}"`).not.toContain(term);
    }
  });

  test('admin dashboard shows link to interests section', async ({ page }) => {
    await adminSignIn(page);
    // Already on /admin after sign-in
    await expect(page.locator('#admin-nav-interests')).toBeVisible();
  });

  // ── API shape ────────────────────────────────────────────────────────────

  test('GET /api/admin/interests returns correctly shaped draft objects', async ({ request }) => {
    const cookie = await getAdminSessionCookie(request);
    const res = await request.get('/api/admin/interests', {
      headers: { cookie },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();

    for (const draft of body.drafts) {
      expect(typeof draft.id).toBe('string');
      expect(typeof draft.status).toBe('string');
      expect(typeof draft.createdAt).toBe('string');
      expect(Array.isArray(draft.items)).toBe(true);
      for (const item of draft.items) {
        expect(typeof item.id).toBe('string');
        expect(typeof item.productName).toBe('string');
        expect(typeof item.quantity).toBe('number');
        expect(typeof item.priceSnapshot).toBe('string');
      }
    }
  });
});

// ── Mobile viewport tests ──────────────────────────────────────────────────

/**
 * These tests re-run selected admin interests scenarios at a mobile viewport
 * (390×844, equivalent to iPhone 14) to verify the responsive layout does not
 * break on narrow screens.
 */
test.describe('admin interests – mobile viewport (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('unauthenticated user is redirected from /admin/interests on mobile', async ({ page }) => {
    await page.goto('/admin/interests');
    expect(page.url()).toContain('/admin/signin');
  });

  test('heading is visible on mobile after authentication', async ({ page }) => {
    await adminSignIn(page);
    await page.goto('/admin/interests');

    await expect(page.locator('#admin-interests-heading')).toBeVisible();
    await expect(page.locator('#admin-interests-heading')).toContainText('Interesses registrados');
  });

  test('either table container or empty state renders on mobile', async ({ page }) => {
    await adminSignIn(page);
    await page.goto('/admin/interests');

    // Wait for async data fetch to complete
    await expect(page.locator('#admin-interests-heading')).toBeVisible();

    // Loading spinner should eventually disappear
    await page.waitForSelector('#admin-interests-loading', { state: 'hidden', timeout: 15_000 }).catch(() => {
      // If #admin-interests-loading was never rendered (already done), that's fine
    });

    const hasTable = await page.locator('#admin-interests-table').count();
    const hasEmpty = await page.locator('#admin-interests-empty').count();
    expect(
      hasTable + hasEmpty,
      'Either #admin-interests-table or #admin-interests-empty must render on mobile',
    ).toBeGreaterThan(0);
  });

  test('admin interests page has no horizontal overflow on mobile', async ({ page }) => {
    await adminSignIn(page);
    await page.goto('/admin/interests');

    await expect(page.locator('#admin-interests-heading')).toBeVisible();

    // The document body must not exceed the viewport width (no horizontal overflow)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(
      scrollWidth,
      `Page should not overflow horizontally (scrollWidth ${scrollWidth} > clientWidth ${clientWidth})`,
    ).toBeLessThanOrEqual(clientWidth);
  });

  test('admin interests page does not contain forbidden terms on mobile', async ({ page }) => {
    await adminSignIn(page);
    await page.goto('/admin/interests');

    await expect(page.locator('#admin-interests-heading')).toBeVisible();

    const bodyText = await page.locator('body').innerText();
    const normalised = bodyText.toLowerCase();

    const prohibited = [
      'comprar',
      'carrinho',
      'checkout',
      'pagamento',
      'frete',
      'whatsapp',
      'finalizar pedido',
      'pedido final',
    ];
    for (const term of prohibited) {
      expect(
        normalised,
        `Admin interests page must not contain forbidden term on mobile: "${term}"`,
      ).not.toContain(term);
    }
  });
});
