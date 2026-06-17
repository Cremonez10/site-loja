import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/api/health', '/admin/signin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApiPath = pathname === '/api/admin' || pathname.startsWith('/api/admin/');
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (isAdminApiPath) {
    const session = request.cookies.get('admin_session')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (isAdminPath) {
    const session = request.cookies.get('admin_session')?.value;

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
