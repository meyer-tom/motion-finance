"use client"

import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./index"

function ensureUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  return raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`
}

export const authClient = createAuthClient({
  baseURL: ensureUrl(process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL),
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { useSession, signIn, signOut, signUp } = authClient
