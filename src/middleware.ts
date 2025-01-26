import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Temporarily disabled for testing
export default function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - auth pages (signin, signout, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
};