"use client"

import { LayoutDashboard, Plus, Repeat2, Target, Wallet } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { BottomSheet } from "@/components/shared/bottom-sheet"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
] as const

const PILL_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 }

export function BottomNav() {
  const pathname = usePathname()
  const [addOpen, setAddOpen] = useState(false)

  const half = NAV_ITEMS.slice(0, 2)
  const rest = NAV_ITEMS.slice(2)

  function renderItem({ href, label, icon: Icon }: (typeof NAV_ITEMS)[number]) {
    const isActive = pathname === href || pathname.startsWith(`${href}/`)
    return (
      <Link
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-medium text-[10px] transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
        href={href}
        key={href}
      >
        {isActive ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-3 inset-y-1.5 rounded-lg bg-primary/15"
            layoutId="bottom-nav-pill"
            transition={PILL_SPRING}
          />
        ) : null}
        <Icon
          className={cn("relative z-10 h-5 w-5", isActive && "stroke-[2.5]")}
        />
        <span className="relative z-10">{label}</span>
      </Link>
    )
  }

  return (
    <>
      <nav className="fixed right-0 bottom-0 bottom-nav-animate left-0 z-50 border-border border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex items-stretch">
          {half.map(renderItem)}

          {/* Bouton + central */}
          <div className="flex flex-1 items-center justify-center py-2">
            <motion.button
              aria-label="Ajouter une transaction"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-primary to-violet-700 shadow-lg shadow-primary/40"
              onClick={() => setAddOpen(true)}
              type="button"
              whileTap={{ scale: 0.9 }}
            >
              <Plus
                className="h-6 w-6 text-primary-foreground"
                strokeWidth={2.5}
              />
            </motion.button>
          </div>

          {rest.map(renderItem)}
        </div>
      </nav>

      <BottomSheet
        description="Le formulaire d'ajout arrive bientôt."
        onOpenChange={setAddOpen}
        open={addOpen}
        title="Nouvelle transaction"
      >
        <div className="py-8 text-center text-muted-foreground text-sm">
          À venir
        </div>
      </BottomSheet>
    </>
  )
}
