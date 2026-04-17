import { headers } from "next/headers"
import type { ReactNode } from "react"
import { AppShell } from "@/components/app/app-shell"
import { getAccounts } from "@/lib/actions/accounts"
import { getCategoriesForUser } from "@/lib/actions/categories"
import { auth } from "@/lib/auth"

export default async function AppLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // TODO: activer quand la session Better Auth est validée
  // if (!session) redirect("/login")

  const userId = session?.user.id ?? ""

  const [accounts, categories] = await Promise.all([
    userId ? getAccounts() : Promise.resolve([]),
    userId ? getCategoriesForUser(userId) : Promise.resolve([]),
  ])

  return (
    <AppShell
      accounts={accounts}
      categories={categories}
      user={session?.user ?? null}
    >
      {children}
    </AppShell>
  )
}
