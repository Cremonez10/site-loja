import { test, expect } from '@playwright/test';

test.describe('analytics api', () => {
  test('POST /api/analytics/events with valid event returns ok', async ({ request }) => {
    const response = await request.post('/api/analytics/events', {
      data: { name: 'product_viewed', metadata: { productId: 'test', status: 'ACTIVE' } },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test('POST /api/analytics/events with unknown event name returns 400', async ({ request }) => {
    const response = await request.post('/api/analytics/events', {
      data: { name: 'unknown_event', metadata: {} },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Evento inválido.' });
  });

  test('POST /api/analytics/events with nested PII metadata returns 400', async ({ request }) => {
    const response = await request.post('/api/analytics/events', {
      data: {
        name: 'product_viewed',
        metadata: { details: { email: 'test@example.com' } },
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'PII metadata is not allowed' });
  });

  test('POST /api/analytics/events with large metadata returns 400', async ({ request }) => {
    const metadata = { details: 'a'.repeat(10001) };
    const response = await request.post('/api/analytics/events', {
      data: { name: 'product_viewed', metadata },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Metadata is too large' });
  });

  test('POST /api/analytics/events with PII metadata key returns 400', async ({ request }) => {
    const response = await request.post('/api/analytics/events', {
      data: { name: 'age_gate_accepted', metadata: { email: 'test@example.com' } },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'PII metadata is not allowed' });
  });

  test('POST /api/analytics/events with invalid name returns 400', async ({ request }) => {
    const response = await request.post('/api/analytics/events', {
      data: { name: '', metadata: {} },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'Evento inválido.' });
  });
});
