import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminSignin = pathname === '/admin/signin';
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApiPath = pathname === '/api/admin' || pathname.startsWith('/api/admin/');

  if (isAdminApiPath || (isAdminPath && !isAdminSignin)) {
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
