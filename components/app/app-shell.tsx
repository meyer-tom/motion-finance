"use client"

import type { ReactNode } from "react"
import { Suspense } from "react"

import { BottomNav } from "@/components/app/bottom-nav"
import { TopNav } from "@/components/app/top-nav"
import { InstallBanner } from "@/components/pwa/install-banner"
import type {
  AccountOption,
  CategoryOption,
} from "@/components/transactions/transaction-form-sheet"
import { TransactionFormSheet } from "@/components/transactions/transaction-form-sheet"
import { Toaster } from "@/components/ui/toaster"
import type { User } from "@/lib/auth"
import { TransactionFormProvider } from "@/lib/context/transaction-form-context"

interface AppShellProps {
  readonly accounts: AccountOption[]
  readonly categories: CategoryOption[]
  readonly children: ReactNode
  readonly usedTags: string[]
  readonly user: User | null
}

export function AppShell({
  accounts,
  categories,
  children,
  user,
  usedTags,
}: AppShellProps) {
  return (
    <TransactionFormProvider>
      <div className="flex min-h-svh flex-col">
        <TopNav user={user} />
        <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 pb-26 pt-6 md:pb-8 lg:px-6">
          {children}
        </main>
        <BottomNav />
      </div>
      {/* Suspense requis car TransactionFormProvider utilise useSearchParams */}
      <Suspense>
        <TransactionFormSheet
          accounts={accounts}
          categories={categories}
          usedTags={usedTags}
        />
      </Suspense>
      <InstallBanner />
      <Toaster />
    </TransactionFormProvider>
  )
}
