import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Middleware enforces admin_session for all /api/admin/* paths.
// This route only needs to query and return the data.

export async function GET() {
  try {
    const drafts = await prisma.orderDraft.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            priceSnapshot: true,
          },
        },
      },
    });

    // Serialize Decimal fields to string so they are JSON-safe
    const serialized = drafts.map((draft) => ({
      id: draft.id,
      status: draft.status,
      createdAt: draft.createdAt.toISOString(),
      items: draft.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot.toString(),
      })),
    }));

    return NextResponse.json({ drafts: serialized });
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar registros.' }, { status: 500 });
  }
}
