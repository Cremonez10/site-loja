import { test, expect } from '@playwright/test';

test('age gate behaviour on home page', async ({ page }) => {
  await page.goto('/');

  // gate should be visible initially
  await expect(page.locator('text=Este site é destinado a maiores de 18 anos.')).toBeVisible();

  // accept flow
  await page.click('button:has-text("Tenho 18 anos ou mais")');
  await expect(page.locator('text=JoFogo')).toBeVisible();
  await expect(page.locator('text=O catálogo será liberado em etapas futuras.')).toBeVisible();

  // go back and deny (clear storage)
  await page.goto('/');
  await page.evaluate(() => { localStorage.removeItem('age_confirmed'); document.cookie = 'age_confirmed=; Max-Age=0; path=/'; });
  await page.reload();

  await expect(page.locator('text=Este site é destinado a maiores de 18 anos.')).toBeVisible();
  await page.click('button:has-text("Sair")');
  await expect(page.locator('text=Não podemos exibir este conteúdo sem a confirmação de idade.')).toBeVisible();
  await expect(page.locator('text=JoFogo')).toHaveCount(0);
});
