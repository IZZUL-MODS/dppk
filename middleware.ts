// middleware.ts - Versi Minimal
import { NextRequest, NextResponse } from 'next/server';

// Simple rate limiting (per IP)
const rateLimit = new Map<string, { count: number; time: number }>();

export function middleware(request: NextRequest) {
  // Hanya untuk API deploy
  if (!request.nextUrl.pathname.startsWith('/api/deploy')) {
    return NextResponse.next();
  }

  // Dapatkan IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  const record = rateLimit.get(ip);

  // Rate limit: maks 5 deploy per menit
  if (record && now - record.time < 60000) {
    if (record.count >= 5) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please wait.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    record.count++;
  } else {
    rateLimit.set(ip, { count: 1, time: now });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
