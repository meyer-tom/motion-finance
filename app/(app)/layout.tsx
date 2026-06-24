import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AppShell } from "@/components/app/app-shell"
import { QueryProvider } from "@/components/providers/query-provider"
import { getAccounts } from "@/lib/actions/accounts"
import { getCategoriesForUser } from "@/lib/actions/categories"
import { getUsedTags } from "@/lib/actions/transactions"
import { getAuthSession } from "@/lib/auth/session"
import { CurrencyProvider } from "@/lib/context/currency-context"
import { prisma } from "@/lib/db"

const SESSION_COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth.session_data",
] as const

export default async function AppLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  const session = await getAuthSession()

  if (!session) {
    // Supprime les cookies de session directement (évite la boucle /api/clear-session → /login)
    const cookieStore = await cookies()
    for (const name of SESSION_COOKIES) {
      cookieStore.delete(name)
    }
    redirect("/login")
  }

  const userId = session.user.id

  const [accounts, categories, usedTags, userRecord] = await Promise.all([
    getAccounts(),
    getCategoriesForUser(userId),
    getUsedTags(),
    prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    }),
  ])

  if (accounts.length === 0) {
    redirect("/onboarding")
  }

  const currency = userRecord?.currency ?? "EUR"

  return (
    <QueryProvider>
      <CurrencyProvider initialCurrency={currency}>
        <AppShell
          accounts={accounts}
          categories={categories}
          usedTags={usedTags}
          user={session.user}
        >
          {children}
        </AppShell>
      </CurrencyProvider>
    </QueryProvider>
  )
}
