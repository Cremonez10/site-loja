import { test, expect } from '@playwright/test';

// Helper: set age confirmation in browser storage + cookie before page load
async function confirmAge(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('age_confirmed', 'true');
  });
  await page.context().addCookies([
    {
      name: 'age_confirmed',
      value: '1',
      domain: '127.0.0.1',
      path: '/',
      sameSite: 'Lax',
    },
  ]);
}

test.describe('product detail page', () => {
  test('shows AgeGate before accepting age on /products/produto-dev-001', async ({ page }) => {
    // Navigate WITHOUT age confirmation
    await page.goto('/products/produto-dev-001');

    // AgeGate must be visible
    await expect(
      page.locator('text=Este site é destinado a maiores de 18 anos.')
    ).toBeVisible();

    // Product content must NOT be visible yet
    await expect(page.locator('#pdp-product-name')).toHaveCount(0);
    await expect(page.locator('#pdp-main')).toHaveCount(0);
  });

  test('loads product detail after accepting age on /products/produto-dev-001', async ({ page }) => {
    await confirmAge(page);
    await page.goto('/products/produto-dev-001');

    // AgeGate must NOT appear
    await expect(
      page.locator('text=Este site é destinado a maiores de 18 anos.')
    ).toHaveCount(0);

    // Product name must appear
    await expect(page.locator('#pdp-product-name')).toBeVisible();
    await expect(page.locator('#pdp-product-name')).toContainText('Relax Intimate Kit');

    // Price must appear
    await expect(page.locator('#pdp-price')).toBeVisible();

    // Back link must appear
    await expect(page.locator('#pdp-back-link')).toBeVisible();

    // AgeGate must not be present
    await expect(
      page.locator('text=Este site é destinado a maiores de 18 anos.')
    ).toHaveCount(0);
  });

  test('shows not-found state for /products/produto-inexistente after age confirmed', async ({ page }) => {
    await confirmAge(page);
    await page.goto('/products/produto-inexistente');

    // Should show not-found heading
    await expect(page.locator('text=Produto não encontrado')).toBeVisible();

    // Back link must be present
    await expect(page.locator('#pdp-back-link')).toBeVisible();

    // Product content must not appear
    await expect(page.locator('#pdp-product-name')).toHaveCount(0);
  });

  test('product detail page does not contain prohibited terms', async ({ page }) => {
    await confirmAge(page);
    await page.goto('/products/produto-dev-001');

    // Wait for product to load
    await expect(page.locator('#pdp-product-name')).toBeVisible();

    const bodyText = await page.locator('body').innerText();
    const normalised = bodyText.toLowerCase();

    // None of these words should appear
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
      expect(normalised, `Page must not contain prohibited term: "${term}"`).not.toContain(term);
    }
  });

  test('OUT_OF_STOCK product shows "Indisponível no momento"', async ({ page }) => {
    await confirmAge(page);
    // produto-dev-002 has status OUT_OF_STOCK in seed
    await page.goto('/products/produto-dev-002');

    // Wait for product to load (name should appear)
    await expect(page.locator('#pdp-product-name')).toBeVisible();

    // Out-of-stock indicator must be present
    await expect(page.locator('text=Indisponível no momento').first()).toBeVisible();
  });

  // ── Phase 5B: interest flow ─────────────────────────────────

  test('ACTIVE product shows "Tenho interesse" button', async ({ page }) => {
    await confirmAge(page);
    await page.goto('/products/produto-dev-001');

    // Wait for product to load
    await expect(page.locator('#pdp-product-name')).toBeVisible();

    // Interest button must be visible for ACTIVE products
    await expect(page.locator('#pdp-interest-btn')).toBeVisible();
    await expect(page.locator('#pdp-interest-btn')).toContainText('Tenho interesse');
  });

  test('OUT_OF_STOCK product does not show interest button', async ({ page }) => {
    await confirmAge(page);
    await page.goto('/products/produto-dev-002');

    // Wait for product to load
    await expect(page.locator('#pdp-product-name')).toBeVisible();

    // Interest button must NOT be present for OUT_OF_STOCK products
    await expect(page.locator('#pdp-interest-btn')).toHaveCount(0);
  });

  test('ACTIVE product interest submission shows success state', async ({ page }) => {
    await confirmAge(page);

    // Intercept the order-drafts API call to return a successful response without DB writes
    await page.route('/api/order-drafts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'draft-mock-001',
          status: 'DRAFT',
          items: [{ id: 'item-mock-001', productId: 'prod-mock-001', productName: 'Mock Product', quantity: 1, priceSnapshot: '199.90' }],
          totalCents: 19990,
        }),
      });
    });

    await page.goto('/products/produto-dev-001');
    await expect(page.locator('#pdp-product-name')).toBeVisible();

    // Click the interest button
    await page.locator('#pdp-interest-btn').click();

    // Success state must appear, button must be gone
    await expect(page.locator('#pdp-interest-success')).toBeVisible();
    await expect(page.locator('#pdp-interest-success')).toContainText('Interesse registrado com discrição');
    await expect(page.locator('#pdp-interest-btn')).toHaveCount(0);
  });

  test('ACTIVE product interest submission shows error state on API failure', async ({ page }) => {
    await confirmAge(page);

    // Force the order-drafts call to fail
    await page.route('/api/order-drafts', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('/products/produto-dev-001');
    await expect(page.locator('#pdp-product-name')).toBeVisible();

    // Click the interest button
    await page.locator('#pdp-interest-btn').click();

    // Error message must appear, button must still be present for retry
    await expect(page.locator('#pdp-interest-error')).toBeVisible();
    await expect(page.locator('#pdp-interest-btn')).toBeVisible();
  });
});
