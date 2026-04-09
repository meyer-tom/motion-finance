"use client"

import type { ReactNode } from "react"

import { BottomNav } from "@/components/app/bottom-nav"
import { Header } from "@/components/app/header"
import { AppSidebar } from "@/components/app/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { User } from "@/lib/auth"

interface AppShellProps {
  readonly children: ReactNode
  readonly user: User | null
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <Header user={user} />
        {/* pb sur mobile pour laisser la place à la bottom nav (56px + safe area) */}
        <main className="flex-1 p-4 pb-[calc(1rem+56px+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
