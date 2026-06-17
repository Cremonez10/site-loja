import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'admin-protected', message: 'Admin route placeholder' });
}
