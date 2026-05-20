"use client"

import { motion } from "framer-motion"
import { LayoutDashboard, Plus, Repeat2, Target, Wallet } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { useTransactionForm } from "@/lib/context/transaction-form-context"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
] as const

const PILL_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 }

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon: React.ElementType
  isActive: boolean
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
      href={href}
    >
      {isActive && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-primary/12"
          layoutId="dock-pill"
          transition={PILL_SPRING}
        />
      )}
      <Icon
        className={cn("relative z-10 h-[22px] w-[22px]", isActive && "stroke-[2.5]")}
      />
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const { openForm } = useTransactionForm()

  const half = NAV_ITEMS.slice(0, 2)
  const rest = NAV_ITEMS.slice(2)

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{ paddingBottom: `max(env(safe-area-inset-bottom), 16px)` }}
    >
      <div className="flex items-center gap-1 rounded-full border border-border/50 bg-card/90 px-2 py-2 shadow-xl shadow-black/15 backdrop-blur-xl">
        {half.map(({ href, label, icon }) => (
          <NavItem
            href={href}
            icon={icon}
            isActive={pathname === href || pathname.startsWith(`${href}/`)}
            key={href}
            label={label}
          />
        ))}

        {/* Bouton + central */}
        <motion.button
          aria-label="Ajouter une transaction"
          className="mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40"
          onClick={() => openForm()}
          type="button"
          whileTap={{ scale: 0.88 }}
        >
          <Plus className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
        </motion.button>

        {rest.map(({ href, label, icon }) => (
          <NavItem
            href={href}
            icon={icon}
            isActive={pathname === href || pathname.startsWith(`${href}/`)}
            key={href}
            label={label}
          />
        ))}
      </div>
    </nav>
  )
}
