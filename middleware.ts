import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin', '/api/admin'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    // Placeholder: future auth check for admin session cookie HttpOnly
    const authorized = false;

    if (!authorized) {
      return NextResponse.redirect(new URL('/admin/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
