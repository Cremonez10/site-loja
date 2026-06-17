import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '../../../../../lib/auth/session';

export async function POST() {
  const secure = process.env.NODE_ENV === 'production';
  const cookie = `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;${secure ? ' Secure;' : ''}`;
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', cookie);
  return res;
}
