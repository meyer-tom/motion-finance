import { headers } from "next/headers"
import type { ReactNode } from "react"
import { AppShell } from "@/components/app/app-shell"
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

  return <AppShell user={session?.user ?? null}>{children}</AppShell>
}
