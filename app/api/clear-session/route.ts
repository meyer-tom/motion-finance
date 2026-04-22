import { NextResponse } from "next/server"

const SESSION_COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth.session_data",
]

export function GET() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.BETTER_AUTH_URL ?? "http://localhost:3000")
  )
  for (const name of SESSION_COOKIES) {
    response.cookies.delete(name)
  }
  return response
}
