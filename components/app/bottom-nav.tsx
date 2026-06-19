"use client"

import { motion } from "framer-motion"
import {
  LandmarkIcon,
  LayoutDashboard,
  Plus,
  Repeat2,
  Settings,
  Target,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useTransactionForm } from "@/lib/context/transaction-form-context"
import { cn } from "@/lib/utils"

const NAV_LEFT = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/accounts", label: "Comptes", icon: LandmarkIcon },
] as const

const NAV_RIGHT = [
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
  { href: "/settings", label: "Paramètres", icon: Settings },
] as const

const ALL_NAV = [...NAV_LEFT, ...NAV_RIGHT]

const PILL_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 }

export function BottomNav() {
  const pathname = usePathname()
  const { openForm } = useTransactionForm()
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [pill, setPill] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const activeIndex = ALL_NAV.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  )

  useEffect(() => {
    if (activeIndex < 0) {
      return
    }
    const el = navRefs.current[activeIndex]
    if (!el) {
      return
    }
    setPill({
      x: el.offsetLeft,
      y: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    })
  }, [activeIndex])

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed right-0 bottom-0 left-0 z-50 flex justify-center md:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
    >
      <div className="relative flex items-center gap-0.5 rounded-full border border-border/50 bg-card/90 px-2 py-2 shadow-black/15 shadow-xl backdrop-blur-xl">
        {pill ? (
          <motion.span
            animate={{ x: pill.x, width: pill.width }}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-primary/12"
            initial={false}
            style={{ top: pill.y, height: pill.height, left: 0 }}
            transition={PILL_SPRING}
          />
        ) : null}

        {NAV_LEFT.map(({ href, label, icon: Icon }, i) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className={cn(
                "relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={href}
              key={href}
              ref={(el) => {
                navRefs.current[i] = el
              }}
            >
              <Icon
                className={cn("h-[21px] w-[21px]", isActive && "stroke-[2.5]")}
              />
            </Link>
          )
        })}

        <motion.button
          aria-label="Ajouter une transaction"
          className="mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40"
          onClick={() => openForm()}
          type="button"
          whileTap={{ scale: 0.88 }}
        >
          <Plus className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
        </motion.button>

        {NAV_RIGHT.map(({ href, label, icon: Icon }, i) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          const refIndex = NAV_LEFT.length + i
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className={cn(
                "relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={href}
              key={href}
              ref={(el) => {
                navRefs.current[refIndex] = el
              }}
            >
              <Icon
                className={cn("h-[21px] w-[21px]", isActive && "stroke-[2.5]")}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
