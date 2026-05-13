import { type NextRequest, NextResponse } from "next/server"

const SESSION_COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth.session_data",
]

export function GET(request: NextRequest) {
  // Utilise l'URL de la requête comme base pour le redirect, pas BETTER_AUTH_URL.
  // BETTER_AUTH_URL vaut "http://localhost:3000" en dev, ce qui enverrait
  // les appareils mobiles vers le localhost du téléphone (injoignable).
  const response = NextResponse.redirect(new URL("/login", request.url))
  for (const name of SESSION_COOKIES) {
    response.cookies.delete(name)
  }
  return response
}
