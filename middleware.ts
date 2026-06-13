import { NextRequest, NextResponse } from 'next/server';

// Rate limiting sederhana
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 menit
const RATE_LIMIT_MAX = 5; // Maksimal 5 deploy per menit per IP

export function middleware(request: NextRequest) {
  // Hanya untuk API deploy
  if (!request.nextUrl.pathname.startsWith('/api/deploy')) {
    return NextResponse.next();
  }

  // Dapatkan IP client
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const record = rateLimit.get(ip);

  // Cek rate limit
  if (record && now < record.resetAt) {
    if (record.count >= RATE_LIMIT_MAX) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests. Please wait a moment before deploying again.' 
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    record.count++;
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }

  // Cleanup
  if (Math.random() < 0.05) {
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetAt) rateLimit.delete(key);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};