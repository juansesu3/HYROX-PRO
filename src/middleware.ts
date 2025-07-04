import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = ['/', '/dashboard', '/profile', '/chat', '/settings'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Verificar si la ruta es protegida (exacta o cualquier subruta)
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !token) {
    // Redirigir a login con callbackUrl para volver después
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configurar matcher para que pase solo por middleware las rutas protegidas
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/settings/:path*'
  ],
};
