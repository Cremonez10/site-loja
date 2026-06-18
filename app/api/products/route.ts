import { NextResponse } from 'next/server';
import { getPublicProducts } from '../../../lib/catalog/queries';
import { hasAgeConfirmationFromCookieHeader } from '../../../lib/age/guard';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!hasAgeConfirmationFromCookieHeader(cookieHeader)) {
    return NextResponse.json({ error: 'Age confirmation required' }, { status: 403 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get('category') ?? undefined;
  const search = url.searchParams.get('search') ?? undefined;
  const page = Number(url.searchParams.get('page') ?? '1');
  const limit = Number(url.searchParams.get('limit') ?? '12');

  const response = await getPublicProducts({
    category: category ?? undefined,
    search: search ?? undefined,
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 12 : limit,
  });

  return NextResponse.json(response);
}
