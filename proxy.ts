import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")
  const { pathname } = request.nextUrl

  // Routes publiques (pas de protection)
  const isPublicRoute = pathname === "/"
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register")

  // Si pas de session et route protégée → redirection /login
  if (!sessionToken && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si session existante et route auth → redirection /dashboard
  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
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
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
