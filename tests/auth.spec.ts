import { test, expect } from '@playwright/test';

test('admin api protected and admin signin flow', async ({ page, request }) => {
  // API without cookie should be 401 from middleware
  const res = await request.get('/api/admin');
  expect(res.status()).toBe(401);
  expect(await res.json()).toEqual({ error: 'Unauthorized' });

  // /admin should redirect to signin
  await page.goto('/admin');
  expect(page.url()).toContain('/admin/signin');

  // signin page is public
  await page.goto('/admin/signin');
  await expect(page.locator('text=Acesso administrativo')).toBeVisible();

  // invalid login shows error
  await page.fill('input[type="email"]', 'nope@example.com');
  await page.fill('input[type="password"]', 'wrong');
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Credenciais inválidas.')).toBeVisible();

  // valid login (seed must have created this user)
  await page.fill('input[type="email"]', 'admin@jofogo.dev');
  await page.fill('input[type="password"]', 'Dev@2026!');
  await Promise.all([
    page.waitForNavigation(),
    page.click('button:has-text("Entrar")'),
  ]);

  expect(page.url()).toContain('/admin');

  // click logout
  await page.click('button:has-text("Sair")');
  await page.waitForURL('**/admin/signin');

  // after logout, /admin should redirect again
  await page.goto('/admin');
  expect(page.url()).toContain('/admin/signin');
});
