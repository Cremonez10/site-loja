import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, ADMIN_SESSION_COOKIE } from './lib/auth/session';

const PUBLIC_PATHS = ['/', '/api/health', '/admin/signin', '/api/admin/auth/signin', '/api/admin/auth/signout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApiPath = pathname === '/api/admin' || pathname.startsWith('/api/admin/');
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (isPublicPath) return NextResponse.next();

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySession(cookie);

  if (isAdminApiPath) {
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.next();
  }

  if (isAdminPath) {
    // allow signin page
    if (pathname === '/admin/signin') return NextResponse.next();

    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/signin';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
