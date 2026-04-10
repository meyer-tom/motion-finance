import { headers } from "next/headers"
// import { redirect } from "next/navigation"
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

  // if (!session) {
  //   redirect("/sign-in")
  // }

  return <AppShell user={session?.user ?? null}>{children}</AppShell>
}
