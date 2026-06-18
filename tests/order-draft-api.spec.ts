import { test, expect } from '@playwright/test';

test.describe('order draft api', () => {
  test('POST /api/order-drafts without age cookie returns 403', async ({ request }) => {
    const response = await request.post('/api/order-drafts', { data: { items: [] } });
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ error: 'Age confirmation required' });
  });

  test('POST /api/order-drafts with invalid payload returns 400', async ({ request }) => {
    const response = await request.post('/api/order-drafts', {
      headers: { cookie: 'age_confirmed=1' },
      data: { items: [{ productId: '', quantity: 0 }] },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/order-drafts with duplicate productId returns 400', async ({ request }) => {
    const listing = await request.get('/api/products', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(listing.status()).toBe(200);
    const body = await listing.json();
    const activeProduct = body.items.find((item: any) => item.status === 'ACTIVE');
    expect(activeProduct).toBeDefined();

    const response = await request.post('/api/order-drafts', {
      headers: { cookie: 'age_confirmed=1' },
      data: {
        items: [
          { productId: activeProduct.id, quantity: 1 },
          { productId: activeProduct.id, quantity: 1 },
        ],
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Itens duplicados no pedido.' });
  });

  test('POST /api/order-drafts with active product creates draft and returns totalCents', async ({ request }) => {
    const listing = await request.get('/api/products', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(listing.status()).toBe(200);

    const body = await listing.json();
    const activeProduct = body.items.find((item: any) => item.status === 'ACTIVE');
    expect(activeProduct).toBeDefined();

    const response = await request.post('/api/order-drafts', {
      headers: { cookie: 'age_confirmed=1' },
      data: {
        items: [{ productId: activeProduct.id, quantity: 1 }],
      },
    });

    expect(response.status()).toBe(200);
    const draft = await response.json();
    expect(draft).toEqual(expect.objectContaining({ id: expect.any(String), status: expect.any(String), totalCents: expect.any(Number), items: expect.any(Array) }));
    expect(draft.totalCents).toBeGreaterThan(0);
    expect(Number.isInteger(draft.totalCents)).toBe(true);
    expect(draft.items[0]).toEqual(expect.objectContaining({ productId: activeProduct.id, quantity: 1 }));
  });

  test('POST /api/order-drafts with notes longer than 500 characters returns 400', async ({ request }) => {
    const listing = await request.get('/api/products', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(listing.status()).toBe(200);
    const body = await listing.json();
    const activeProduct = body.items.find((item: any) => item.status === 'ACTIVE');
    expect(activeProduct).toBeDefined();

    const longNotes = 'a'.repeat(501);
    const response = await request.post('/api/order-drafts', {
      headers: { cookie: 'age_confirmed=1' },
      data: {
        items: [{ productId: activeProduct.id, quantity: 1 }],
        notes: longNotes,
      },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/order-drafts with quantity above max returns 400', async ({ request }) => {
    const listing = await request.get('/api/products', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(listing.status()).toBe(200);
    const body = await listing.json();
    const activeProduct = body.items.find((item: any) => item.status === 'ACTIVE');
    expect(activeProduct).toBeDefined();

    const response = await request.post('/api/order-drafts', {
      headers: { cookie: 'age_confirmed=1' },
      data: {
        items: [{ productId: activeProduct.id, quantity: 21 }],
      },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/order-drafts rejects out-of-stock or inactive products', async ({ request }) => {
    const listing = await request.get('/api/products', {
      headers: { cookie: 'age_confirmed=1' },
    });
    expect(listing.status()).toBe(200);

    const body = await listing.json();
    const unavailableProduct = body.items.find((item: any) => item.status === 'OUT_OF_STOCK');
    expect(unavailableProduct).toBeDefined();

    const response = await request.post('/api/order-drafts', {
      headers: { cookie: 'age_confirmed=1' },
      data: { items: [{ productId: unavailableProduct.id, quantity: 1 }] },
    });
    expect(response.status()).toBe(400);
  });
});
