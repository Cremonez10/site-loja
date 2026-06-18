import { test, expect } from '@playwright/test';

test.describe('catalog api', () => {
  test('GET /api/categories without age cookie returns 403', async ({ request }) => {
    const response = await request.get('/api/categories');
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ error: 'Age confirmation required' });
  });

  test('GET /api/categories with age cookie returns categories', async ({ request }) => {
    const response = await request.get('/api/categories', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(response.status()).toBe(200);
    const categories = await response.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), slug: expect.any(String), name: expect.any(String), description: expect.any(String) }),
    );
  });

  test('GET /api/products without age cookie returns 403', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ error: 'Age confirmation required' });
  });

  test('GET /api/products with age cookie returns products excluding inactive and internal items', async ({ request }) => {
    const response = await request.get('/api/products', {
      headers: { cookie: 'age_confirmed=true' },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('pagination');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.every((item: any) => item.status !== 'INACTIVE')).toBe(true);
    expect(data.items.every((item: any) => item.slug !== 'produto-dev-012')).toBe(true);
  });

  test('GET /api/products supports pagination', async ({ request }) => {
    const response = await request.get('/api/products?page=1&limit=2', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(2);
    expect(data.pagination.total).toBeGreaterThanOrEqual(1);
    expect(data.pagination.totalPages).toBeGreaterThanOrEqual(1);
    expect(data.items.length).toBeLessThanOrEqual(2);
  });

  test('GET /api/products/[slug] with valid public slug returns 200', async ({ request }) => {
    const response = await request.get('/api/products/produto-dev-001', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(response.status()).toBe(200);
    const product = await response.json();
    expect(product).toEqual(expect.objectContaining({ id: expect.any(String), slug: 'produto-dev-001', name: expect.any(String), status: 'ACTIVE' }));
  });

  test('GET /api/products/[slug] with internal slug returns 404', async ({ request }) => {
    const response = await request.get('/api/products/produto-dev-012', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'Product not found' });
  });

  test('GET /api/products/[slug] with nonexistent slug returns 404', async ({ request }) => {
    const response = await request.get('/api/products/unknown-slug', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'Product not found' });
  });
});
