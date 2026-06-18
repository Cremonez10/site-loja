import { NextResponse } from 'next/server';
import { getPublicCategories } from '../../../lib/catalog/queries';
import { hasAgeConfirmationFromCookieHeader } from '../../../lib/age/guard';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!hasAgeConfirmationFromCookieHeader(cookieHeader)) {
    return NextResponse.json({ error: 'Age confirmation required' }, { status: 403 });
  }

  const categories = await getPublicCategories();
  return NextResponse.json(categories);
}
