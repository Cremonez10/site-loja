import { NextResponse } from 'next/server';
import { getPublicProductBySlug } from '../../../../lib/catalog/queries';
import { hasAgeConfirmationFromCookieHeader } from '../../../../lib/age/guard';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!hasAgeConfirmationFromCookieHeader(cookieHeader)) {
    return NextResponse.json({ error: 'Age confirmation required' }, { status: 403 });
  }

  const url = new URL(req.url);
  const slug = url.pathname.split('/').pop() ?? '';
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}
