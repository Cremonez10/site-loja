import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import type { Prisma } from '@prisma/client';

const ALLOWED_EVENT_NAMES = new Set([
  'age_gate_viewed',
  'age_gate_accepted',
  'age_gate_rejected',
  'catalog_viewed',
  'category_viewed',
  'search_performed',
  'product_viewed',
  'product_added_to_order',
  'product_removed_from_order',
  'order_quantity_changed',
  'order_intent_started',
  'order_intent_sent',
  'whatsapp_message_copied',
  'admin_login_success',
  'admin_product_created',
  'admin_product_updated',
  'admin_product_status_changed',
]);

const BLOCKED_KEYS = new Set([
  'email',
  'phone',
  'whatsapp',
  'cpf',
  'document',
  'password',
  'address',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasBlockedMetadataKeys(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasBlockedMetadataKeys);
  }

  if (!isPlainObject(value)) {
    return false;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (BLOCKED_KEYS.has(key.toLowerCase())) {
      return true;
    }

    if (hasBlockedMetadataKeys(nested)) {
      return true;
    }
  }

  return false;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isPlainObject(body)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const metadataValue = body.metadata;
  const metadata = typeof metadataValue === 'undefined' ? {} : isPlainObject(metadataValue) ? metadataValue : null;

  if (!name || name.length > 80 || !ALLOWED_EVENT_NAMES.has(name)) {
    return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
  }

  if (metadata === null) {
    return NextResponse.json({ error: 'Metadata deve ser um objeto.' }, { status: 400 });
  }

  if (hasBlockedMetadataKeys(metadata)) {
    return NextResponse.json({ error: 'PII metadata is not allowed' }, { status: 400 });
  }

  const metadataString = JSON.stringify(metadata);
  if (metadataString.length > 10_000) {
    return NextResponse.json({ error: 'Metadata is too large' }, { status: 400 });
  }

  await prisma.analyticsEvent.create({
    data: {
      name,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ ok: true });
}
