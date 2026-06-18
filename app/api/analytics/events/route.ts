import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import type { Prisma } from '@prisma/client';

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

function hasBlockedMetadataKeys(metadata: Record<string, unknown>) {
  for (const key of Object.keys(metadata)) {
    if (BLOCKED_KEYS.has(key.toLowerCase())) {
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
  const metadata = isPlainObject(body.metadata) ? body.metadata : {} as Record<string, Prisma.InputJsonValue>;

  if (!name || name.length === 0 || name.length > 80) {
    return NextResponse.json({ error: 'Invalid event name' }, { status: 400 });
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
