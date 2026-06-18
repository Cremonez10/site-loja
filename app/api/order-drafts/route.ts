import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { hasAgeConfirmationFromCookieHeader } from '../../../lib/age/guard';

const MAX_DISTINCT_ITEMS = 20;
const MAX_ITEM_QUANTITY = 20;
const MAX_NOTES_LENGTH = 500;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!hasAgeConfirmationFromCookieHeader(cookieHeader)) {
    return NextResponse.json({ error: 'Age confirmation required' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isPlainObject(body)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Items are required' }, { status: 400 });
  }

  if (items.length > MAX_DISTINCT_ITEMS) {
    return NextResponse.json({ error: 'Too many distinct items' }, { status: 400 });
  }

  if (notes && notes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json({ error: 'Notes are too long' }, { status: 400 });
  }

  const preparedItems = [] as {
    productId: string;
    quantity: number;
  }[];

  for (const item of items) {
    if (!isPlainObject(item)) {
      return NextResponse.json({ error: 'Invalid item format' }, { status: 400 });
    }

    const productId = typeof item.productId === 'string' ? item.productId.trim() : '';
    const quantity = typeof item.quantity === 'number' ? item.quantity : NaN;

    if (!productId) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    preparedItems.push({ productId, quantity });
  }

  const productIds = [...new Set(preparedItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      internal: false,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products are not available' }, { status: 400 });
  }

  const productsById = products.reduce<Record<string, typeof products[number]>>((map, product) => {
    map[product.id] = product;
    return map;
  }, {});

  const itemsToCreate = preparedItems.map((item) => {
    const product = productsById[item.productId];
    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      priceSnapshot: product.price,
    };
  });

  const orderDraft = await prisma.orderDraft.create({
    data: {
      notes: notes || undefined,
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      items: true,
    },
  });

  const totalCents = orderDraft.items.reduce((sum, item) => {
    return sum + Number(item.priceSnapshot.toString()) * item.quantity * 100;
  }, 0);

  return NextResponse.json({
    id: orderDraft.id,
    status: orderDraft.status,
    items: orderDraft.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot.toString(),
    })),
    totalCents,
  });
}
