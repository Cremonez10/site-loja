import { test, expect } from '@playwright/test';

test('age gate behaviour on home page', async ({ page }) => {
  await page.goto('/');

  // gate should be visible initially
  await expect(page.locator('text=Este site é destinado a maiores de 18 anos.')).toBeVisible();

  // catalog content must NOT be visible before confirmation
  await expect(page.locator('text=Catálogo discreto')).toHaveCount(0);
  await expect(page.locator('text=Buscar por nome ou descrição')).toHaveCount(0);

  // accept flow
  await page.click('button:has-text("Tenho 18 anos ou mais")');

  // after accepting, catalog shell should appear
  await expect(page.locator('h2:has-text("Catálogo discreto")')).toBeVisible();
  await expect(page.getByPlaceholder('Buscar por nome ou descrição')).toBeVisible();

  // go back and deny (clear storage)
  await page.goto('/');
  await page.evaluate(() => { localStorage.removeItem('age_confirmed'); document.cookie = 'age_confirmed=; Max-Age=0; path=/'; });
  await page.reload();

  await expect(page.locator('text=Este site é destinado a maiores de 18 anos.')).toBeVisible();
  await page.click('button:has-text("Sair")');
  await expect(page.locator('text=Não podemos exibir este conteúdo sem a confirmação de idade.')).toBeVisible();

  // catalog content must remain blocked after deny
  await expect(page.locator('h2:has-text("Catálogo discreto")')).toHaveCount(0);
  await expect(page.locator('text=Buscar por nome ou descrição')).toHaveCount(0);
});
