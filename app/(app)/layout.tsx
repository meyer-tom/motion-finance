import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AppShell } from "@/components/app/app-shell"
import { QueryProvider } from "@/components/providers/query-provider"
import { getAccounts } from "@/lib/actions/accounts"
import { getCategoriesForUser } from "@/lib/actions/categories"
import { getUsedTags } from "@/lib/actions/transactions"
import { auth } from "@/lib/auth"
import { CurrencyProvider } from "@/lib/context/currency-context"
import { prisma } from "@/lib/db"

export default async function AppLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    // Passe par le Route Handler pour supprimer les cookies stales avant la redirection
    redirect("/api/clear-session")
  }

  const userId = session.user.id

  const [accounts, categories, usedTags, userRecord] = await Promise.all([
    getAccounts(),
    getCategoriesForUser(userId),
    getUsedTags(),
    prisma.user.findUnique({ where: { id: userId }, select: { currency: true } }),
  ])

  const currency = userRecord?.currency ?? "EUR"

  return (
    <QueryProvider>
      <CurrencyProvider initialCurrency={currency}>
        <AppShell
          accounts={accounts}
          categories={categories}
          user={session.user}
          usedTags={usedTags}
        >
          {children}
        </AppShell>
      </CurrencyProvider>
    </QueryProvider>
  )
}
