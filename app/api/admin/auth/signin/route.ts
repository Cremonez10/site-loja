import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signSession, ADMIN_SESSION_COOKIE } from '../../../../../lib/auth/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    // sempre retornar genérico
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = await signSession({ adminId: user.id, email: user.email, role: user.role });

    const secure = process.env.NODE_ENV === 'production';
    const cookie = `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8};${secure ? ' Secure;' : ''}`;

    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
