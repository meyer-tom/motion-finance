"use client"

import { LayoutDashboard, Plus, Repeat2, Target, Wallet } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransactionForm } from "@/lib/context/transaction-form-context"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
]

export function BottomNav() {
  const pathname = usePathname()
  const { openForm } = useTransactionForm()

  const half = NAV_ITEMS.slice(0, 2)
  const rest = NAV_ITEMS.slice(2)

  return (
    <nav className="fixed right-0 bottom-0 bottom-nav-animate left-0 z-50 border-border border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="flex items-stretch">
        {/* 2 premiers liens */}
        {half.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 font-medium text-[10px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={href}
              key={href}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* Bouton + central */}
        <div className="flex flex-1 items-center justify-center py-2">
          <button
            aria-label="Ajouter une transaction"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform active:scale-95"
            onClick={() => openForm()}
            type="button"
          >
            <Plus
              className="h-6 w-6 text-primary-foreground"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* 2 derniers liens */}
        {rest.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 font-medium text-[10px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={href}
              key={href}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
