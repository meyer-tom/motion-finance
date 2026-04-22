"use client"

import type { ReactNode } from "react"
import { Suspense } from "react"

import { BottomNav } from "@/components/app/bottom-nav"
import { Header } from "@/components/app/header"
import { AppSidebar } from "@/components/app/sidebar"
import type {
  AccountOption,
  CategoryOption,
} from "@/components/transactions/transaction-form-sheet"
import { TransactionFormSheet } from "@/components/transactions/transaction-form-sheet"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { User } from "@/lib/auth"
import { TransactionFormProvider } from "@/lib/context/transaction-form-context"

interface AppShellProps {
  readonly accounts: AccountOption[]
  readonly categories: CategoryOption[]
  readonly children: ReactNode
  readonly user: User | null
  readonly usedTags: string[]
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
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="min-w-0 overflow-x-hidden">
          <Header user={user} />
          {/* pb sur mobile pour laisser la place à la bottom nav (56px + safe area) */}
          <div className="p-4 pb-[calc(1rem+56px+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
            {children}
          </div>
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
      {/* Suspense requis car TransactionFormProvider utilise useSearchParams */}
      <Suspense>
        <TransactionFormSheet accounts={accounts} categories={categories} usedTags={usedTags} />
      </Suspense>
    </TransactionFormProvider>
  )
}
