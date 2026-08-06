import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Enterprise Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=()'
  );

  // Admin Route Protection
  const path = req.nextUrl.pathname;
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const sessionCookie = req.cookies.get('expo_admin_session');
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
