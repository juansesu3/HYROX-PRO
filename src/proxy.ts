// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const locales = ['en', 'es', 'fr'];

const baseProtectedRoutes = ['/', '/dashboard', '/profile', '/chat', '/settings'];

const protectedRoutes = [
  ...baseProtectedRoutes,
  ...locales.flatMap((locale) =>
    baseProtectedRoutes.map((route) =>
      route === '/' ? `/${locale}` : `/${locale}${route}`
    )
  ),
];

const intlProxy = createMiddleware(routing);

function getLocaleFromPath(pathname: string): string | null {
  const seg = pathname.split('/').filter(Boolean)[0];
  return locales.includes(seg) ? seg : null;
}

export async function proxy(request: NextRequest) {
  const intlResponse = intlProxy(request);
  const { pathname } = request.nextUrl;

  const locale = getLocaleFromPath(pathname);
  const loginPath = locale ? `/${locale}/login` : `/login`;
  const registerPath = locale ? `/${locale}/register` : `/register`;

  // 0) Rutas SIEMPRE públicas (invites, reset, etc.)
  const isPublicInviteRoute =
    pathname.startsWith('/invite/duo/') ||
    locales.some((loc) => pathname.startsWith(`/${loc}/invite/duo/`));

  if (isPublicInviteRoute) {
    return intlResponse; // nunca exige login
  }

  // 1) login y register públicos
  const isAuthPublicRoute =
    pathname === loginPath ||
    pathname.startsWith(`${loginPath}/`) ||
    pathname === registerPath ||
    pathname.startsWith(`${registerPath}/`);

  if (isAuthPublicRoute) {
    return intlResponse;
  }

  // 2) comprobar si la ruta es protegida
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected) {
    return intlResponse;
  }

  // 3) comprobar sesión
  const hasSessionCookie =
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token');

  if (!hasSessionCookie) {
    const url = new URL(loginPath, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = new URL(loginPath, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
