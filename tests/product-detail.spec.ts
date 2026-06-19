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
    const prohibited = ['comprar', 'carrinho', 'checkout', 'pagamento', 'frete', 'whatsapp'];
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
});
