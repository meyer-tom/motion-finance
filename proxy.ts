import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  // Better Auth préfixe les cookies avec "__Secure-" en production (HTTPS)
  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token")
  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email")

  const isPublicRoute = pathname === "/" || isAuthRoute

  // Si pas de session et route protégée → redirection /login
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (favicons)
     * - icons/ (PWA icons — fetchés sans session par le browser/installer)
     * - sw.js (Service Worker)
     * - manifest.webmanifest (PWA manifest)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.png|icons/|sw\\.js|manifest\\.webmanifest).*)",
  ],
}
