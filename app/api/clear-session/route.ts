import { type NextRequest, NextResponse } from "next/server"

const SESSION_COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth.session_data",
] as const

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url))
  const isSecure = request.url.startsWith("https://")

  for (const name of SESSION_COOKIES) {
    // __Secure- préfixe exige Secure:true pour être supprimé en production
    response.cookies.set({
      name,
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure || name.startsWith("__Secure-"),
    })
  }
  return response
}
